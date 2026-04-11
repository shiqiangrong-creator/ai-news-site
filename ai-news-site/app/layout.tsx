import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI 资讯聚合 | 量子位 & 机器之心',
  description: '汇聚量子位、机器之心等优质AI资讯源的最新动态，由DeepSeek AI提供智能摘要',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
