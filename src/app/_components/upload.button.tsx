"use client";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";

const formSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title must contain at least 1 characters" })
    .max(50, { message: "Title must not exceed 50 characters" }),
  file: z
    .instanceof(FileList)
    .refine((file) => file?.length == 1, "File is required."),
});

const UploadButton = () => {
  const organization = useOrganization();
  const user = useUser();
  const { toast } = useToast();
  const mutateAddFile = useMutation(api.files.createFile);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  let orgId: any = null;

  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });
  const fileRef = form.register("file");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const postUrl = await generateUploadUrl();

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": values.file[0].type },
        body: values.file[0],
      });

      const { storageId } = await result.json();
      await mutateAddFile({
        name: values.title,
        fileId: storageId,
        orgId,
      });
      form.reset();
      setIsOpenDialog(false);
      toast({
        variant: "success",
        title: "File Uploaded",
        description: "Now eveyone can view your file",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went  wrong",
        description: "Your file could not be uploaded, try again later.",
      });
    }
  }
  return (
    <Dialog
      open={isOpenDialog}
      onOpenChange={(isOpen) => {
        setIsOpenDialog(isOpen);
        form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>Upload file</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogDescription>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="testing..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          className="  cursor-pointer"
                          placeholder="upload file.."
                          {...fileRef}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button disabled={form.formState.isSubmitting} type="submit">
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className=" mr-2 h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Upload</span>
                  )}
                </Button>
              </form>
            </Form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
