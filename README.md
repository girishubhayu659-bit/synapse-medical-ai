# 🧠 Synapse Medical AI: Advanced Brain Tumor Segmentation

[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/AI-PyTorch-EE4C2C?style=flat&logo=pytorch)](https://pytorch.org/)
[![Docker](https://img.shields.io/badge/Deployed-Docker%20%7C%20Hugging%20Face-2496ED?style=flat&logo=docker)](https://huggingface.co/)

**Live Application:** [synapse-medical-ai.vercel.app](https://synapse-medical-ai.vercel.app) *(Note: The AI backend sleeps after 48h of inactivity. Please allow 2-3 minutes for the initial cold-start).*

## 🚀 Overview
Synapse is a decoupled, full-stack medical web application designed to automate the segmentation of brain tumors from MRI scans. It leverages an **Attention U-Net** deep learning architecture (with a ResNet50 backbone) to isolate tumor regions, calculate spatial coordinates, and estimate tumor volume in real-time.

## ✨ Key Technical Features
* **Decoupled Architecture:** A Vercel-hosted Next.js edge-network frontend communicating via REST API with a dedicated Linux backend container.
* **Attention-Guided Computer Vision:** Generates multiple localized attention maps (AG4, AG2, AG0) to visualize coarse location, texture regions, and fine edges.
* **Spatial & Volumetric Analysis:** Calculates 3D spatial coordinates (X, Y, Z) and estimates physical tumor volume (cc) using OpenCV pixel normalization and contouring.
* **Containerized Cloud Deployment:** Backend API wrapped in a custom Dockerfile and deployed via Hugging Face Spaces for heavy GPU/CPU tensor processing.

## 🏗️ System Architecture 
The project is built using a Monorepo structure containing two primary microservices:

### 1. `synapse-vision` (Frontend)
* Framework: Next.js / React
* Styling: Tailwind CSS
* Responsibility: Handles user uploads, Base64 image decoding, state management, and real-time UI updates for the attention heatmaps.

### 2. `synapse-backend` (AI API)
* Framework: FastAPI (Python)
* AI/ML Libraries: PyTorch, OpenCV, NumPy, Torchvision
* Responsibility: Receives standard image arrays, converts to PyTorch tensors, runs the Attention U-Net inference, performs thresholding (0.8), and returns base64-encoded visualizations.

## 📸 Application Preview

**1. The UI/UX: Algorithmic Oncology Engine**

<img width="1919" height="858" alt="Screenshot 2026-05-27 190954" src="https://github.com/user-attachments/assets/78cc4aa3-e65f-485e-b1b1-7be1ea3079a2" />

**2. 3D Spatial Topography & Volume Calculation**

<img width="1919" height="858" alt="Screenshot 2026-05-27 190954" src="https://github.com/user-attachments/assets/86a5a794-3a7d-4a7b-9ece-7881ca842b90" />

**3. The Inference Terminal: Attention Maps Extraction**

<img width="1919" height="850" alt="Screenshot 2026-05-27 191045" src="https://github.com/user-attachments/assets/3446b878-a5e8-4e9d-9264-dee87528bb52" />
