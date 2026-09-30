import { Mail } from "lucide-react";

import { GitHubIcon, LinkedInIcon } from "@/components/ui/icons";
import type { IconComponent } from "@/components/ui/external-link";
import type { SocialIconKey } from "@/content/types";

/**
 * Maps a content-layer icon key to a component. Keeping the key in the data and
 * the component here means `src/content` stays free of React imports.
 */
export const SOCIAL_ICONS: Record<SocialIconKey, IconComponent> = {
  mail: Mail,
  linkedin: LinkedInIcon,
  github: GitHubIcon,
};
