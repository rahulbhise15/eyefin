"use client";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

function getAnonId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("eyefin_anon");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("eyefin_anon", id);
  }
  return id;
}

// The raw anonymous id (used for the Telegram connect deep-link).
export function useAnonId(): string {
  const [anonId, setAnonId] = useState("");
  useEffect(() => setAnonId(getAnonId()), []);
  return anonId;
}

// Anonymous-first identity. Returns the Convex user id once resolved.
export function useUser(): Id<"users"> | null {
  const getOrCreate = useMutation(api.users.getOrCreateUser);
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  useEffect(() => {
    const anonId = getAnonId();
    if (anonId) getOrCreate({ anonId }).then(setUserId).catch(() => {});
  }, [getOrCreate]);
  return userId;
}
