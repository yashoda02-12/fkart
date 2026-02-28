import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useSaveProfile, useUserProfile } from "@/hooks/useQueries";
import { Loader2, LogIn, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ProfilePage() {
  const { identity, login, clear } = useInternetIdentity();
  const { data: profile, isLoading } = useUserProfile();
  const saveProfile = useSaveProfile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await saveProfile.mutateAsync({ name: name.trim(), email: email.trim() });
      toast.success("Profile saved successfully");
      setIsEditing(false);
    } catch {
      toast.error("Failed to save profile");
    }
  };

  if (!identity) {
    return (
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center">
        <User className="h-20 w-20 mx-auto text-muted-foreground/40 mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Login to view your profile
        </h2>
        <p className="text-muted-foreground mb-6">
          Sign in to manage your account.
        </p>
        <Button onClick={login} className="gap-2">
          <LogIn className="h-4 w-4" />
          Login
        </Button>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-4">
          <div className="h-32 bg-muted animate-pulse rounded-xl" />
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
        </div>
      </main>
    );
  }

  const principal = identity.getPrincipal().toString();
  const displayInitial = (name || principal[0] || "U").toUpperCase();

  return (
    <main className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">
        My Profile
      </h1>

      {/* Avatar card */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6 text-center">
        <div className="w-20 h-20 rounded-full fkart-nav flex items-center justify-center mx-auto mb-3 text-white text-3xl font-display font-bold">
          {displayInitial}
        </div>
        <h2 className="font-semibold text-lg text-foreground">
          {name || "Set your name"}
        </h2>
        {email && <p className="text-muted-foreground text-sm">{email}</p>}
        <p className="text-xs text-muted-foreground mt-2 font-mono bg-secondary/60 rounded px-3 py-1 inline-block">
          {principal.slice(0, 32)}...
        </p>
      </div>

      {/* Edit form */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-foreground">Account Details</h2>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
        </div>

        <form
          onSubmit={(e) => {
            void handleSave(e);
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="name" className="text-sm font-medium mb-1.5 block">
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              disabled={!isEditing}
              className={!isEditing ? "bg-muted/50 cursor-default" : ""}
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium mb-1.5 block">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={!isEditing}
              className={!isEditing ? "bg-muted/50 cursor-default" : ""}
            />
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={saveProfile.isPending}
                className="bg-primary text-primary-foreground"
              >
                {saveProfile.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  if (profile) {
                    setName(profile.name);
                    setEmail(profile.email);
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </form>

        <Separator className="my-5" />

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Account Actions
          </h3>
          <Button
            variant="outline"
            className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
            onClick={clear}
          >
            Logout
          </Button>
        </div>
      </div>
    </main>
  );
}
