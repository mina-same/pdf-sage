"use client";
import { Loader2 } from 'lucide-react';
import React, { use } from 'react'
import {Document, Page, pdfjs} from "react-pdf"

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useToast } from './ui/use-toast';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface pdfRendererProps {
    url: string
};

const PdfRenderer = ({url}: pdfRendererProps) => {

  const { toast } = useToast();

  return (
    <div className='w-full bg-white rounded-md flex flex-col items-center shadow'>
        {/* custom funcationalty option */}
        <div className='h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2'>
            <div className='flex items-center gap-1.5'>
                top bar
            </div>
        </div> 
        {/* pdf viewer */}
        <div className='flex-1 w-full max-h-screen'>
          <div>
            <Document 
              loading={ 
                  <div className='flex justify-center'>
                    <Loader2 className='w-10 h-10 text-zinc-500'/>
                  </div>
                }
              onLoadError={ () => {
                    toast({
                      title: 'Error loading pdf',
                      description: "please check your internet connection and try again",
                      variant: "destructive"
                    })
                  }
                }

              file={url} className="max-h-full"
            >
              <Page pageNumber={1} />
            </Document>
          </div>
        </div>
    </div>
  )
}

export default PdfRenderer
