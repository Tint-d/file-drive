"use client";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";

export default function Home() {
  const organization = useOrganization();
  const user = useUser();
  // console.log(user);

  let orgId = null;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const mutateAddFile = useMutation(api.files.createFile);

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");

  const addTofile = () => {
    if (!orgId) {
      return;
    }
    mutateAddFile({
      name: "another personal",
      orgId,
    });
  };

  return (
    <main>
      {files?.map((file, i) => <p key={file._id}>{file.name}</p>)}
      <Button onClick={addTofile}>add files</Button>
    </main>
  );
}
