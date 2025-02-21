export type EventMessage =
  | {
      type: "setup";
      sessionId: string;
      callSid: string;
      parentCallSid: string;
      from: string;
      to: string;
      forwardedFrom: string;
      callerName: string;
      direction: string;
      callType: string;
      callStatus: string;
      accountSid: string;
      applicationSid: string | null;
      customParameters: Record<string, unknown>;
    }
  | {
      type: "prompt";
      voicePrompt: string;
      lang: string;
      last: boolean;
    }
  | {
      type: "interrupt";
      utteranceUntilInterrupt: string;
      durationUntilInterruptMs: number;
    }
  | {
      type: "end";
      handoffData?: string;
    };
