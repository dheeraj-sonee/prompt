import React, { Component, ErrorInfo, ReactNode } from 'react';
import { speakText } from '../utils/speech';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CompanionCare caught an error:', error, errorInfo);
    speakText('An unexpected display issue occurred. A recovery button is ready for you to return safely.');
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-[#f8f9ff] text-[#0d1c2f] flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-12 border-2 border-[#1d4ed8] shadow-xl flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#eff4ff] text-[#1d4ed8] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[48px]">healing</span>
            </div>

            <h1 className="text-[32px] sm:text-[38px] font-bold text-[#0d1c2f] mb-3">
              CompanionCare Recovery
            </h1>

            <p className="text-[20px] sm:text-[22px] text-[#45464d] mb-6 leading-relaxed">
              We had a brief hiccup, but all of your medications and daily schedule are safe.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="min-h-[56px] px-6 rounded-2xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-[20px] shadow-md transition-all active:scale-98"
              >
                Return to Daily Care
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="min-h-[56px] px-6 rounded-2xl bg-white hover:bg-[#eff4ff] text-[#0d1c2f] border-2 border-[#cbd5e1] font-bold text-[20px] transition-all active:scale-98"
              >
                Refresh Screen
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-[#cbd5e1] w-full text-center">
              <span className="text-[17px] text-[#45464d] block mb-1">
                Caregiver Emergency Line:
              </span>
              <a
                href="tel:5552348910"
                className="text-[22px] font-bold text-[#1d4ed8] hover:underline"
              >
                Call Sarah Vance: (555) 234-8910
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
