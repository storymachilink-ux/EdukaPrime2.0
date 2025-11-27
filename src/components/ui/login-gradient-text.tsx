"use client";

import React from "react";

export function LoginGradientText() {
  return (
    <div className="w-full max-w-md mt-5 px-4" style={{ textAlign: 'center' }}>
      <p style={{
        color: '#403B37',
        fontSize: 'clamp(11px, 2vw, 13px)',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        fontWeight: 400,
        lineHeight: '1.6',
        letterSpacing: '-0.01em',
        opacity: 0.85,
        margin: 0
      }}>
        Aqui você encontra o que toda <span style={{ color: '#191F45' }}>mãe e professora procura:</span><br />
        <span style={{ color: '#191F45' }}>atividades prontas, práticas e criativas</span><br />
        para transformar o aprendizado das crianças<br />
        <span style={{ color: '#191F45' }}>sem perder horas</span> na internet!
      </p>
    </div>
  );
}
