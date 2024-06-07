import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "./users";
import { UserIdentity } from "convex/server";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("you must be logged in to upload a file!");
  }
  return await ctx.storage.generateUploadUrl();
});

async function hasAcessToOrg(
  ctx: QueryCtx | MutationCtx,
  orgId: string,
  tokenIdentifier: string
) {
  const user = await getUser(ctx, tokenIdentifier);

  if (!user) {
    return false;
  }

  const hasAccess =
    user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);

  return hasAccess;
}

export const createFile = mutation({
  args: { name: v.string(), fileId: v.id("_storage"), orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("you must be logged into  upload a file!");
    }

    const hasAccess = await hasAcessToOrg(
      ctx,
      args.orgId,
      identity.tokenIdentifier
    );

    if (!hasAccess) {
      throw new ConvexError("you do not have access to this org!");
    }

    await ctx.db.insert("files", {
      name: args.name,
      fileId: args.fileId,
      orgId: args.orgId,
    });
  },
});

export const getFiles = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const hasAccess = await hasAcessToOrg(
      ctx,
      args.orgId,
      identity.tokenIdentifier
    );

    if (!hasAccess) {
      throw new ConvexError("you do not have access to this file!");
    }

    const files = await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    return files;
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("you must be logged into  upload a file!");
    }

    const file = await ctx.db.get(args.fileId);

    if (!file) {
      throw new ConvexError("This file does not exist!");
    }

    const hasAccess = await hasAcessToOrg(
      ctx,
      file.orgId,
      identity.tokenIdentifier
    );
    if (!hasAccess) {
      throw new ConvexError("Do you not have access to delete this file!");
    }

    await ctx.db.delete(args.fileId);
  },
});
