"use client";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";

export default function Home() {
  const origanization = useOrganization();
  const user = useUser();

  const orgId = origanization.organization?.id ?? user.user?.id;
  const mutateAddFile = useMutation(api.files.createFile);

  const files = useQuery(api.files.getFiles, {
    orgId: origanization.organization?.id
      ? (origanization.organization?.id as string)
      : "skip",
  });
  const addTofile = () => {
    mutateAddFile({
      name: "personal",
      orgId: origanization.organization?.id
        ? (origanization.organization?.id as string)
        : "skip",
    });
  };

  return (
    <main>
      {files?.map((file, i) => <p key={file._id}>{file.name}</p>)}
      <Button onClick={addTofile}>add files</Button>
    </main>
  );
}
