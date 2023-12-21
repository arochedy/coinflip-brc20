"use client"
import type { Metadata } from 'next';
import React, { useEffect } from 'react';
import './../../styles/main.scss';
import ReactQueryProvider from './react-query-provider/reactQueryProvider';
import { loadButtonAudio, loadLeverDownAudio, loadLeverUpAudio } from '@/sound';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  useEffect(() => {
    loadButtonAudio();
    loadLeverDownAudio();
    loadLeverUpAudio();
  }, [])


  return (
    <ReactQueryProvider>
      {children}
    </ReactQueryProvider>
  )
}
