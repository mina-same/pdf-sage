"use client";
import { ChevronDown, Loader2, ChevronUp } from 'lucide-react';
import React, { use } from 'react'
import {Document, Page, pdfjs} from "react-pdf"

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useToast } from './ui/use-toast';
import { useResizeDetector } from 'react-resize-detector';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cursorTo } from 'readline';
import { useForm } from "react-hook-form";
import { string, z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { set } from 'date-fns';
import { cn } from '@/lib/utils';


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface pdfRendererProps {
    url: string
};

const PdfRenderer = ({url}: pdfRendererProps) => {

  const [numPages, setNumPages] = React.useState<number>();
  const [nowPage, setNowPage] = React.useState<number>(1);
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();

  // custom page validator using zod and react-hook-form and resolvers
  const CustomPageVaildatior = z.object({
    page: z.string().refine( (num) => Number(num) > 0 && Number(num) <= numPages! )
  })

  type CustomPageVaildatiorType = z.infer<typeof CustomPageVaildatior>

  const {register, handleSubmit, formState: {errors}, setValue} = useForm<CustomPageVaildatiorType>({
    defaultValues:{
      page: "1"
    },
    resolver: zodResolver(CustomPageVaildatior)
  });


  const handlePageSubmit = (data: CustomPageVaildatiorType) => {
    setNowPage(Number(data.page))
    setValue("page", String(data.page))
  }

  return (
    <div className='w-full bg-white rounded-md flex flex-col items-center shadow'>
        {/* custom funcationalty option */}
        <div className='h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2'>
            <div className='flex items-center gap-1.5'>
               <Button 
                disabled={nowPage === undefined || nowPage === 1}
                onClick={() => {
                  setNowPage((prev) => {return prev - 1 > 1 ? prev - 1 : 1;})
                }}
                aria-label='previous page' 
                variant="ghost" 
              >
                <ChevronDown className='h-4 w-4' />
               </Button>

               <div className='flex items-center gap-1.5'>
                <Input 
                  {...register("page")} 
                  onKeyDown={(e) => {
                    if(e.key === "Enter"){
                      handleSubmit(handlePageSubmit)()
                    }
                  }}
                  className={cn("w-12 h-8", errors.page && "focus-visible:ring-red-500")} 
                />
                <p className='text-zinc-700 text-sm space-x-1'>
                  <span>/</span> 
                  <span>{numPages ?? "x"}</span>
                </p>
               </div>

               <Button 
                disabled={nowPage === undefined || nowPage === numPages}
                aria-label='previous page' 
                variant="ghost"
                onClick={() => {
                  setNowPage((prev) => {return prev +1 > numPages! ? numPages! : prev +1;})
                }}
              >
                <ChevronUp className='h-4 w-4'/>
               </Button>
            </div>
        </div> 


        {/* pdf viewer */}
        <div className='flex-1 w-full max-h-screen'>
          <div ref={ref}>
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
              onLoadSuccess={({numPages}) => {
                setNumPages(numPages)
              }}
              file={url} className="max-h-full"
            >
              <Page pageNumber={nowPage} width={width ? width : 1}/>
            </Document>
          </div>
        </div>
    </div>
  )
}

export default PdfRenderer
