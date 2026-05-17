import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        parcours: resolve(__dirname, "parcours/index.html"),
        competences: resolve(__dirname, "competences/index.html"),
        realisations: resolve(__dirname, "realisations/index.html"),
        backend: resolve(__dirname, "realisations/backend/index.html"),
        frontend: resolve(__dirname, "realisations/frontend/index.html"),
        appMobileHangout: resolve(__dirname, "realisations/app-mobile-hangout/index.html"),
        dashboardMonitoringDynatrace: resolve(__dirname, "realisations/dashboard-monitoring-dynatrace/index.html"),
        portailDocumentaire: resolve(__dirname, "realisations/portail-documentaire/index.html"),
        portfolioPersonnel: resolve(__dirname, "realisations/portfolio-personnel/index.html"),
        dashboardMonitoring: resolve(__dirname, "realisations/dashboard-monitoring/index.html"),
        outilExcel: resolve(__dirname, "realisations/outil-excel/index.html"),
        veille: resolve(__dirname, "veille/index.html"),
        contact: resolve(__dirname, "contact/index.html")
      }
    }
  }
});