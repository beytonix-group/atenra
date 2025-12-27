"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-300">Loading API Documentation...</p>
      </div>
    </div>
  ),
});

export default function ApiDocsPage() {
  return (
    <>
      <style jsx global>{`
        /* Dark mode overrides for Swagger UI */
        .swagger-ui {
          background: #1a1a2e;
        }

        /* Main text colors */
        .swagger-ui .opblock-tag,
        .swagger-ui .opblock-tag small {
          color: #e0e0e0 !important;
        }

        /* Endpoint paths */
        .swagger-ui .opblock .opblock-summary-path,
        .swagger-ui .opblock .opblock-summary-path span {
          color: #ffffff !important;
        }

        /* Endpoint descriptions */
        .swagger-ui .opblock .opblock-summary-description {
          color: #b0b0b0 !important;
        }

        /* Section headers and tag descriptions */
        .swagger-ui .opblock-tag-section .opblock-tag small {
          color: #a0a0a0 !important;
        }

        /* Info section */
        .swagger-ui .info .title,
        .swagger-ui .info .title small {
          color: #ffffff !important;
        }

        .swagger-ui .info p,
        .swagger-ui .info li {
          color: #d0d0d0 !important;
        }

        /* Server dropdown */
        .swagger-ui .scheme-container {
          background: #16213e !important;
        }

        .swagger-ui .scheme-container .schemes > label {
          color: #e0e0e0 !important;
        }

        /* Operation blocks background */
        .swagger-ui .opblock {
          border-color: #333 !important;
        }

        .swagger-ui .opblock .opblock-summary {
          border-color: #333 !important;
        }

        /* Expanded operation content */
        .swagger-ui .opblock-body pre,
        .swagger-ui .opblock-description-wrapper p,
        .swagger-ui .opblock-section-header h4,
        .swagger-ui .opblock-section-header label,
        .swagger-ui table thead tr th,
        .swagger-ui table tbody tr td,
        .swagger-ui .parameter__name,
        .swagger-ui .parameter__type,
        .swagger-ui .parameter__in {
          color: #e0e0e0 !important;
        }

        /* Response section */
        .swagger-ui .responses-inner h4,
        .swagger-ui .responses-inner h5,
        .swagger-ui .response-col_status,
        .swagger-ui .response-col_description {
          color: #e0e0e0 !important;
        }

        /* Models section */
        .swagger-ui .model-title,
        .swagger-ui .model {
          color: #e0e0e0 !important;
        }

        /* Links */
        .swagger-ui a {
          color: #60a5fa !important;
        }

        /* Tab headers (Parameters, Responses) */
        .swagger-ui .opblock-section-header,
        .swagger-ui .opblock-section-header h4,
        .swagger-ui .tab li,
        .swagger-ui .tab li button,
        .swagger-ui .tab li button.tablinks {
          color: #ffffff !important;
        }

        /* Parameters tab */
        .swagger-ui .parameters-col_name,
        .swagger-ui .parameters-col_description,
        .swagger-ui .parameters-col_description p,
        .swagger-ui .parameter__name,
        .swagger-ui .parameter__type,
        .swagger-ui .parameter__deprecated,
        .swagger-ui .parameter__in {
          color: #e0e0e0 !important;
        }

        /* Responses section header */
        .swagger-ui .responses-wrapper .opblock-section-header h4,
        .swagger-ui .response-col_links,
        .swagger-ui .response-col_links .response-undocumented {
          color: #e0e0e0 !important;
        }

        /* "No links" and other muted text */
        .swagger-ui .response-col_links i,
        .swagger-ui .response-col_links .response-undocumented,
        .swagger-ui span.response-undocumented {
          color: #a0a0a0 !important;
        }

        /* Responses header bar */
        .swagger-ui .responses-header td,
        .swagger-ui .responses-header .col_header {
          color: #ffffff !important;
        }

        /* All table headers */
        .swagger-ui table.headers th,
        .swagger-ui table.headers td,
        .swagger-ui .col_header {
          color: #e0e0e0 !important;
        }

        /* Default values and italics */
        .swagger-ui .parameter__default,
        .swagger-ui em {
          color: #b0b0b0 !important;
        }

        /* Required asterisk */
        .swagger-ui .parameter__name.required::after {
          color: #f87171 !important;
        }

        /* Try it out button area */
        .swagger-ui .try-out__btn {
          color: #1a1a2e !important;
        }

        /* Markdown descriptions */
        .swagger-ui .markdown p,
        .swagger-ui .markdown li,
        .swagger-ui .renderedMarkdown p {
          color: #e0e0e0 !important;
        }

        /* Response descriptions */
        .swagger-ui .response .response-col_description,
        .swagger-ui .response .response-col_description p,
        .swagger-ui .response .response-col_description__inner {
          color: #e0e0e0 !important;
        }

        /* Opblock section header backgrounds */
        .swagger-ui .opblock .opblock-section-header {
          background: rgba(0, 0, 0, 0.3) !important;
        }

        /* Select dropdowns */
        .swagger-ui select,
        .swagger-ui .content-type {
          color: #1a1a2e !important;
        }
      `}</style>
      <div className="min-h-screen bg-[#1a1a2e]">
        <SwaggerUI url="/api/openapi.json" />
      </div>
    </>
  );
}
