# Health Florence - Official Software Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Roles](#user-roles)
4. [Core Features](#core-features)
   - [Authentication & Security](#authentication--security)
   - [Health Dashboard](#health-dashboard)
   - [Appointment System](#appointment-system)
   - [Expert Network](#expert-network)
   - [Florence AI Assistant](#florence-ai-assistant)
   - [File Management](#file-management)
   - [HAIC Token Rewards (XRPL)](#haic-token-rewards-xrpl)
5. [Role-Specific Guides](#role-specific-guides)
   - [Patient Guide](#patient-guide)
   - [Healthcare Provider Guide](#healthcare-provider-guide)
   - [Administrator Guide](#administrator-guide)
6. [Technical Architecture](#technical-architecture)

---

## Introduction

**Health Florence** is a next-generation healthcare platform designed to bridge the gap between patients and healthcare providers using advanced AI and blockchain technology. It empowers users to manage their health proactively while offering professionals tools to deliver better care.

### Key Differentiators
*   **Florence AI**: A context-aware AI assistant powered by Google Gemini 2.0.
*   **Blockchain Rewards**: Earn HAIC tokens for healthy behaviors, secured by the XRP Ledger (XRPL).
*   **Secure File Vault**: HIPAA-compliant document storage for medical records.
*   **Comprehensive Care**: Integrated appointment booking, goal tracking, and dietary planning.

---

## Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   AWS Amplify CLI installed and configured
*   Git

### Installation
1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd health-florence
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory with the following keys:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key
    VITE_XRPL_NETWORK=testnet # or mainnet
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

---

## User Roles

The platform serves three distinct user types:

1.  **Patients (Users)**: Individuals managing their health, booking appointments, and tracking goals.
2.  **Experts (Providers)**: Doctors, nutritionists, and specialists who manage patients and appointments.
3.  **Administrators**: System overseers who manage users, verify experts, and monitor audit trails.

---

## Core Features

### Authentication & Security
*   **Secure Sign-Up/Login**: Powered by AWS Cognito.
*   **Role-Based Access Control (RBAC)**: Ensures users only access data relevant to their role.
*   **Session Management**: Automatic timeouts and secure session handling.

### Health Dashboard
*   **Vitals Tracking**: Monitor BMI, weight, blood pressure, and more.
*   **Visual Analytics**: Charts and graphs to visualize health trends over time.
*   **Daily Overview**: Upcoming appointments, active goals, and medication reminders at a glance.

### Appointment System
*   **Easy Booking**: Search for experts by specialization and availability.
*   **Calendar Integration**: View and manage appointments in a calendar view.
*   **Status Updates**: Real-time updates (Scheduled, Completed, Cancelled).
*   **Rescheduling**: Easy options to reschedule or cancel appointments.

### Expert Network
*   **Find Experts**: specialized search with filters for specialty, rating, and location.
*   **Profiles**: Detailed expert profiles with qualifications, reviews, and availability.
*   **Direct Communication**: (Planned) Secure messaging between patients and experts.

### Florence AI Assistant
*   **24/7 Health Companion**: Ask questions about symptoms, nutrition, or general wellness.
*   **Context-Aware**: Florence knows your health profile and tailors advice (e.g., considering your allergies for meal plans).
*   **Capabilities**:
    *   **Dietary Planning**: Generates personalized meal plans.
    *   **Goal Setting**: Suggests SMART health goals.
    *   **Wellness Tips**: Provides daily health advice.
*   **Safety First**: Florence does *not* provide medical diagnoses and always refers to professionals for serious concerns.

### File Management
A robust system for handling medical documents and images.
*   **Supported Files**: PDF, DOCX, JPG, PNG (up to 10MB).
*   **Categorization**: Organize files into Medical Records, Insurance, Lab Results, etc.
*   **Security**: Files are encrypted at rest in AWS S3 with strict access policies.

### HAIC Token Rewards (XRPL)
Gamified health management using blockchain.
*   **Earn Tokens**: Complete health goals, adhere to dietary plans, or attend appointments to earn Health AI Coins (HAIC).
*   **Wallet**: Integrated wallet to view balance and transaction history.
*   **Transparency**: All rewards and transactions are auditable on the XRP Ledger.

---

## Role-Specific Guides

### Patient Guide
*   **Profile Setup**: Complete your health profile (allergies, conditions) for better AI recommendations.
*   **Booking**: Navigate to "Find Expert" to book your first consultation.
*   **Goals**: Set a health goal in the "Health Goals" section and track your progress daily to earn HAIC.

### Healthcare Provider Guide
*   **Dashboard**: View your daily appointment schedule and patient list.
*   **Patient Records**: Access (permissioned) patient health data and uploaded documents.
*   **Verification**: Upload professional documents to get the "Verified" badge.

### Administrator Guide
*   **User Management**: Suspend/activate users and manage roles.
*   **Audit Logs**: View system-wide activity logs for security and compliance.
*   **Analytics**: Monitor platform growth, token distribution, and appointment volume.

---

## Technical Architecture

*   **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI.
*   **Backend**: AWS Amplify (Gen 2), GraphQL (AppSync), DynamoDB.
*   **AI Engine**: Google Gemini 2.0 Flash.
*   **Blockchain**: XRPL (XRP Ledger) via `xrpl.js`.
*   **Storage**: Amazon S3.

### Database Schema (Simplified)
*   **User**: Stores profile, role, and bio-data.
*   **Appointment**: Links User and Doctor with time and status.
*   **HealthMetrics**: Time-series data for vitals.
*   **Files**: Metadata for S3 objects.
*   **Transactions**: Records of HAIC token movements.

---

## Support

For technical issues or feature requests, please contact the development team or refer to the internal issue tracker.
