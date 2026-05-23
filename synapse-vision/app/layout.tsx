import type { Metadata } from "next";
import "./globals.css";

// 1. PROFESSIONAL METADATA
// This changes the browser tab title and what shows up if you share the link.
export const metadata: Metadata = {
  title: "Synapse Vision | Deep Tech MRI Segmentation",
  description: "Automated Brain Tumor Segmentation via Attention U-Net. Achieving 85.2% IoU through advanced spatial filtering. A B.Tech Minor Project.",
  keywords: ["Medical AI", "Brain Tumor Segmentation", "Attention U-Net", "ResNet-50", "Neuro-Oncology", "Deep Learning"],
  authors: [{ name: "Synapse Vision Team" }],
  creator: "KIIT University Research Team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-[#030712] text-white selection:bg-cyan-500/30">
        {children}
      </body>
    </html>
  );
}
