import React, { useState } from "react";
import {
  IconChevronRight,
  IconFileUpload,
  IconProgress,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStateContext } from "../../context/index";
import ReactMarkdown from "react-markdown";
import FileUploadModal from "./components/file-upload-modal";
import RecordDetailsHeader from "./components/record-details-header";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

function SingleRecordDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [processing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(
    state.analysisResult || "",
  );
  const [filename, setFilename] = useState("");
  const [filetype, setFileType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { updateRecord } = useStateContext();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("Selected file:", file);
    setFileType(file.type);
    setFilename(file.name);
    setFile(file);
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    console.log("Starting file upload...");
    setUploading(true);
    setUploadSuccess(false);

    try {
      console.log("Initializing Gemini API...");
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      console.log("API Key present:", !!geminiApiKey);

      console.log("Reading file as base64...");
      const base64Data = await readFileAsBase64(file);
      console.log("File converted to base64");

      // Check if file type is supported
      const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!supportedTypes.includes(filetype)) {
        throw new Error('Unsupported file type. Please upload a JPEG, PNG, WebP image, or PDF file.');
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log("Model initialized");

      const prompt = `You are an expert cancer and any disease diagnosis analyst. Use your knowledge base to answer questions about giving personalized recommended treatments.
        Analyze the provided medical document and give a detailed treatment plan. Make it readable, clear and easy to understand in paragraphs.
        Include:
        1. Analysis of the medical document/image
        2. Potential diagnosis
        3. Recommended treatment steps
        4. Follow-up care suggestions
        5. Any additional relevant medical insights`;

      const contentParts = [
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: filetype
          }
        }
      ];

      console.log("Sending request to Gemini...");
      const result = await model.generateContent(contentParts);
      console.log("Received response from Gemini");

      const response = await result.response;
      const text = response.text();
      console.log("Generated text:", text.substring(0, 100) + "...");

      setAnalysisResult(text);
      console.log("Updating record...");
      
      const updatedRecord = await updateRecord({
        documentID: state.id,
        analysisResult: text,
        kanbanRecords: "",
      });
      console.log("Record updated successfully");

      setUploadSuccess(true);
      setIsModalOpen(false);
      setFilename("");
      setFile(null);
      setFileType("");
    } catch (error) {
      console.error("Error in handleFileUpload:", error);
      alert("Error uploading file: " + error.message);
      setUploadSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  const processTreatmentPlan = async () => {
    setIsProcessing(true);

    try {
      console.log("Starting treatment plan processing...");
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      console.log("API Key present:", !!geminiApiKey);

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log("Model initialized");

      // Trim and clean the analysis result
      const cleanedAnalysis = analysisResult.trim();
      console.log("Analysis length:", cleanedAnalysis.length);

      const prompt = `Based on this medical analysis: "${cleanedAnalysis}"

Create a structured treatment plan with tasks categorized into the following stages. Return ONLY a JSON object in this exact format:

{
  "columns": [
    { "id": "todo", "title": "Todo" },
    { "id": "doing", "title": "Work in progress" },
    { "id": "done", "title": "Done" }
  ],
  "tasks": [
    { "id": "1", "columnId": "todo", "content": "Task description" }
  ]
}

Ensure each task is specific, actionable, and relevant to the medical treatment plan. Do not include any additional text or explanation, only the JSON object.`;

      console.log("Sending request to Gemini...");
      const result = await model.generateContent(prompt);
      console.log("Received response from Gemini");
      
      const response = await result.response;
      const text = response.text();
      console.log("Raw response:", text);

      // Validate and clean the JSON response
      let parsedResponse;
      try {
        // Remove any potential markdown code block markers
        const cleanJson = text.replace(/\`\`\`json|\`\`\`|\`/g, '').trim();
        parsedResponse = JSON.parse(cleanJson);
        
        // Validate the structure
        if (!parsedResponse.columns || !parsedResponse.tasks || 
            !Array.isArray(parsedResponse.columns) || !Array.isArray(parsedResponse.tasks)) {
          throw new Error('Invalid response structure');
        }
      } catch (error) {
        console.error('Failed to parse Gemini response:', error);
        throw new Error('Failed to generate valid treatment plan structure');
      }

      console.log("Parsed response:", parsedResponse);
      
      // Update the record with the new kanban data
      const updatedRecord = await updateRecord({
        documentID: state.id,
        kanbanRecords: JSON.stringify(parsedResponse),
      });

      if (updatedRecord) {
        console.log("Record updated successfully");
        // Navigate with the parsed kanban data
        navigate("/screening-schedules", { state: parsedResponse });
      } else {
        throw new Error("Failed to update record");
      }
    } catch (error) {
      console.error("Error in processTreatmentPlan:", error);
      alert("Error processing treatment plan: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-[26px]">
      <button
        type="button"
        onClick={handleOpenModal}
        className="mt-6 inline-flex items-center gap-x-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-[#13131a] dark:text-white dark:hover:bg-neutral-800"
      >
        <IconFileUpload />
        Upload Reports
      </button>
      <FileUploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onFileChange={handleFileChange}
        onFileUpload={handleFileUpload}
        uploading={uploading}
        uploadSuccess={uploadSuccess}
        filename={filename}
      />
      <RecordDetailsHeader recordName={state.recordName} />
      <div className="w-full">
        <div className="flex flex-col">
          <div className="-m-1.5 overflow-x-auto">
            <div className="inline-block min-w-full p-1.5 align-middle">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-[#13131a]">
                <div className="border-b border-gray-200 px-6 py-4 dark:border-neutral-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200">
                    Personalized AI-Driven Treatment Plan
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    A tailored medical strategy leveraging advanced AI insights.
                  </p>
                </div>
                <div className="flex w-full flex-col px-6 py-4 text-gray-800 dark:text-white">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Analysis Result
                    </h2>
                    <div className="space-y-2 text-gray-800 dark:text-white">
                      <ReactMarkdown className="prose prose-gray dark:prose-invert max-w-none">
                        {analysisResult}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-2 sm:flex">
                    <button
                      type="button"
                      onClick={processTreatmentPlan}
                      className="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                    >
                      View Treatment plan
                      <IconChevronRight size={20} />
                      {processing && (
                        <IconProgress
                          size={10}
                          className="mr-3 h-5 w-5 animate-spin"
                        />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 border-t border-gray-200 px-6 py-4 md:flex md:items-center md:justify-between dark:border-neutral-700">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                      <span className="font-semibold text-gray-800 dark:text-neutral-200"></span>{" "}
                    </p>
                  </div>
                  <div>
                    <div className="inline-flex gap-x-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleRecordDetails;
