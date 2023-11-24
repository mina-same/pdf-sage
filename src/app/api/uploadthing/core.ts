import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
 
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
          url: `https://uploadthing.s3.amazonaws.com/${file.key}`,
          uplaodStatus: "PROCCESSING",
        }
      });
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;