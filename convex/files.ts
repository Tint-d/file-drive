import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { getUser } from "./users";
import { UserIdentity } from "convex/server";

async function hasAcessToOrg(
  ctx: QueryCtx | MutationCtx,
  orgId: string,
  tokenIdentifier: string
) {
  const user = await getUser(ctx, tokenIdentifier);

  if (!user) {
    console.log("User not found for token:", tokenIdentifier);
    return false;
  }

  const hasAccess =
    user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);

  if (!hasAccess) {
    throw new ConvexError("you do not have access to this org!");
  }

  return hasAccess;
}

export const createFile = mutation({
  args: { name: v.string(), orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("identity =>", identity);

    if (!identity) {
      throw new ConvexError("you must be logged into  upload a file!");
    }

    await hasAcessToOrg(ctx, args.orgId, identity.tokenIdentifier);

    await ctx.db.insert("files", { name: args.name, orgId: args.orgId });
  },
});

export const getFiles = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }
    // console.log("Identity found:", identity);
    // console.log("Query orgId:", args.orgId);
    // const hasAccess = await hasAcessToOrg(
    //   ctx,
    //   args.orgId,
    //   identity.tokenIdentifier
    // );

    // if (!hasAccess) {
    //   return [];
    // }

    const files = await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    return files;
  },
});
