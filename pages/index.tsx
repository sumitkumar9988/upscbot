import { useRef, useState, useEffect } from 'react';
import Layout from '@/components/layout';
import { motion } from 'framer-motion';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import { Document } from 'langchain/document';
import axios from 'axios';
import * as gtag from '../lib/gtag';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://owdctnadxcocraiszcyp.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93ZGN0bmFkeGNvY3JhaXN6Y3lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODE1NDk5NTUsImV4cCI6MTk5NzEyNTk1NX0.TPYuycPPK5K592i4znnYbg6pqFzUOCe2x6unLUZfGd8';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message:
          "I am an expert on the book called 'INDIAN POLITY' by M. Laxmikant and A Brief History of Modern India (Spectrum) by Rajiv Ahir. You may ask anything from it",
        type: 'apiMessage',
      },
    ],
    history: [],
  });

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();
    messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
    }));

    gtag.event({
      action: 'ask_question',
      category: 'Chat',
      label: question,
      value: question.length,
    });

    setLoading(true);
    setQuery('');
    console.log('index:trying to ask question', question);
    try {
      // console.log('history', history);
      console.log('history', history);
      console.log('question', question);
      let body = {
        question,
        history,
      };

      console.log('body', body);
      //
      const response = await fetch('https://prep.shootup.tech/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          history: history,
        }),
      });
      const data = await response.json();
      await supabase
        .from('prompt')
        .insert([{ prompt: question, history: history }]);

      console.log('response', response);
      console.log('data', data);

      console.log('data', data);

      if (data.error) {
        setError(data.error);
      } else {
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'apiMessage',
              message: data.text,
              sourceDocs: data.sourceDocuments,
            },
          ],
          history: [...state.history, [question, data.text]],
        }));
      }
      console.log('index:messageState', messageState);

      setLoading(false);

      //scroll to bottom
      window.requestAnimationFrame(() => {
        messageListRef.current?.scrollTo(
          0,
          messageListRef.current.scrollHeight,
        );
      });
    } catch (error) {
      setLoading(false);
      console.log('index:error', error);
      setError('An error occurred while fetching the data. Please try again.');
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <>
      <Layout>
        <div className="mx-auto flex flex-col gap-4">
          <div>
            <motion.div className=" border-black cursor-pointer  rounded-md p-2">
              <motion.p
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 1 }}
                transition={{
                  ease: 'linear',
                  duration: 2,
                  repeat: Infinity,
                }}
                animate={{ opacity: 1, scale: 1.2 }}
                className="text-green-700 font-bold text-center"
              >
                <a href="https://wa.link/ym5hkk" target="_blank">
                  Get Directly Access of Telegram and Whatsapp Bot
                </a>
              </motion.p>
            </motion.div>
          </div>
          <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
            Talk with UPSC chatbot in Hindi and English Language
          </h1>
          <div>
            <div className="text-base font-black underline pb-4">
              Starting Example Prompt:-
            </div>
            <ul className="flex flex-col gap-2 list-inside list-disc">
              <li className="text-sm font-normal ">hello</li>
              <li className="text-sm font-normal ">
                aap kya kya kar sakte ho ?
              </li>
              <li className="text-sm font-normal ">
                How can I use the expert AI bot to help me prepare for a
                political science exam?
              </li>
              <li className="text-sm font-normal ">
                What are some key topics covered in Indian Polity by M.
                Laxmikant?
              </li>
              <li className="text-sm font-normal ">
                Tell me about this topics in brief - Fundamental Rights ?
              </li>
              <li className="text-sm font-normal ">
                Ask me any question about topic or on book
              </li>
            </ul>
          </div>

          <main className={styles.main}>
            <div className={styles.cloud}>
              <div ref={messageListRef} className={styles.messagelist}>
                {messages.map((message, index) => {
                  let icon;
                  let className;
                  if (message.type === 'apiMessage') {
                    icon = (
                      <Image
                        key={index}
                        src="/bot-image.png"
                        alt="AI"
                        width="40"
                        height="40"
                        className={styles.boticon}
                        priority
                      />
                    );
                    className = styles.apimessage;
                  } else {
                    icon = (
                      <Image
                        key={index}
                        src="/usericon.png"
                        alt="Me"
                        width="30"
                        height="30"
                        className={styles.usericon}
                        priority
                      />
                    );
                    // The latest message sent by the user will be animated while waiting for a response
                    className =
                      loading && index === messages.length - 1
                        ? styles.usermessagewaiting
                        : styles.usermessage;
                  }
                  return (
                    <>
                      <div key={`chatMessage-${index}`} className={className}>
                        {icon}
                        <div className={styles.markdownanswer}>
                          <ReactMarkdown linkTarget="_blank">
                            {message.message}
                          </ReactMarkdown>
                        </div>
                      </div>
                      {/* {message.sourceDocs && (
                        <div
                          className="p-5"
                          key={`sourceDocsAccordion-${index}`}
                        >
                          <Accordion
                            type="single"
                            collapsible
                            className="flex-col"
                          >
                            {message.sourceDocs.map((doc, index) => (
                              <div key={`messageSourceDocs-${index}`}>
                                <AccordionItem value={`item-${index}`}>
                                  <AccordionTrigger>
                                    <h3>Source {index + 1}</h3>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <ReactMarkdown linkTarget="_blank">
                                      {doc.pageContent}
                                    </ReactMarkdown>
                                    <p className="mt-2">
                                      <b>Source:</b> {doc.metadata.source}
                                    </p>
                                  </AccordionContent>
                                </AccordionItem>
                              </div>
                            ))}
                          </Accordion>
                        </div>
                      )} */}
                    </>
                  );
                })}
              </div>
            </div>
            <div className={styles.center}>
              <div className={styles.cloudform}>
                <form onSubmit={handleSubmit}>
                  <textarea
                    disabled={loading}
                    onKeyDown={handleEnter}
                    ref={textAreaRef}
                    autoFocus={false}
                    rows={1}
                    maxLength={512}
                    id="userInput"
                    name="userInput"
                    placeholder={
                      loading ? 'Waiting for response...' : 'Ask me anything...'
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.textarea}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.generatebutton}
                  >
                    {loading ? (
                      <div className={styles.loadingwheel}>
                        <LoadingDots color="#000" />
                      </div>
                    ) : (
                      // Send icon SVG in input field
                      <svg
                        viewBox="0 0 20 20"
                        className={styles.svgicon}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {error && (
              <div className="border border-red-400 rounded-md p-4">
                <p className="text-red-500">{error}</p>
              </div>
            )}
          </main>
        </div>
      </Layout>
    </>
  );
}
