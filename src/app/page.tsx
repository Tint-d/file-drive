"use client";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import UploadButton from "./_components/upload.button";
import FileCard from "./_components/file-card";

export default function Home() {
  const organization = useOrganization();
  const user = useUser();

  let orgId: any = null;

  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");

  return (
    <main className=" container py-24">
      <div className=" flex justify-between items-center mb-4">
        <h3>Your Files</h3>
        <UploadButton />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {files?.map((file, i) => <FileCard key={file._id} file={file} />)}
      </div>
    </main>
  );
}
