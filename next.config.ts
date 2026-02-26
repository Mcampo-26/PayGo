import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Agregamos esto para que Mercado Pago pueda entrar sin ser bloqueado por ngrok
  async headers() {
    return [
      {
        source: "/api/payments/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "ngrok-skip-browser-warning", value: "true" },
        ],
      },
    ];
  },
};

export default nextConfig;