export const getBaseUrl = () => {
    // 1. Forzamos NGR si existe (QUITAMOS CUALQUIER RUTA EXTRA)
    if (process.env.NGR) {
      return process.env.NGR.replace(/\/$/, ""); 
    }
    
    // 2. Si no hay NGR, usamos Vercel
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
    }
  
    return "http://localhost:3000";
  };