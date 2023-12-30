import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { pinecone } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

const f = createUploadthing();


export const ourFileRouter = {

  pdfUploader: f({ image: { maxFileSize: "4MB" }, pdf: { maxFileSize: "4MB" } })

    .middleware(async ({ req }) => {

      const {getUser} = getKindeServerSession();
      const user = getUser();

      if(!user || !user.id) { throw new Error("UNAUTHORIZED"); }

      return {userId: user.id};
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createdFile = await db.file.create({
        data: {
          id: file.key,
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
          uplaodStatus: "PROCCESSING",
        }
      });

        try{
          const response = await fetch(`https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`)
          const blob = await response.blob();

          const loader = new PDFLoader(blob);

          const pageLEvelDocs = await loader.load();

          const pagesAmt = pageLEvelDocs.length;

          const pineconeIndex = pinecone.Index("pdf-sage");

          const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY!,
          });

          await PineconeStore.fromDocuments(pageLEvelDocs, embeddings, {
            pineconeIndex,
            namespace: createdFile.id
          })

          await db.file.update({
            data: {
              uplaodStatus: "SUCCESS",
            },
            where: {
              id: createdFile.id,
            }
          })

          } catch(e){
            await db.file.update({
              data: {
                uplaodStatus: "FAILED",
              },
              where: {
                id: createdFile.id, 
              }
            })
          }

    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;