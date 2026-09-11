/**
 * Utility to detect and block disposable and temporary email domains.
 * Blocks services like Yopmail, Mailinator, GuerrillaMail, 10MinuteMail, TempMail, etc.
 */

// Common disposable domain keywords / wildcards
const DISPOSABLE_KEYWORDS = [
  "yopmail",
  "mailinator",
  "tempmail",
  "temp-mail",
  "disposable",
  "trashmail",
  "10minutemail",
  "10minute",
  "10minemail",
  "fakeinbox",
  "fakemail",
  "generator.email",
  "burnermail",
  "mailnesia",
  "maildrop",
  "sharklasers",
  "guerrillamail",
  "getairmail",
  "mohmal",
  "inboxkitten",
  "throwawaymail",
  "throwaway",
  "mytemp",
  "crazymailing",
  "dispostable",
  "10mail",
  "getnada",
  "pokemail",
  "spam4me",
  "emailondeck",
  "dropmail",
  "minutemail",
  "tempinbox",
  "mailcatch",
  "meltmail",
  "jetable",
  "disbox",
  "tmpmail",
  "tmpeml",
  "tempmailer",
  "emailfake",
  "fake-box",
  "binkmail",
  "safetymail",
  "suremail",
  "chacuo",
  "0-mail",
  "inboxbear",
  "generator-email",
  "trash-mail",
  "spamfree",
  "guerrilla",
  "incognitomail",
  "anonymbox",
  "anonbox",
  "temporaryemail",
  "temporary-email",
  "spamgourmet",
  "sneakemail",
  "harakirimail",
  "byom",
  "mytempmail",
  "nowmymail",
  "trashymail",
  "trashmail",
  "filzmail",
  "tempemail",
  "tempm",
];

// Curated list of known disposable and temporary email domains
const POPULAR_DISPOSABLE_DOMAINS = new Set([
  // Yopmail ecosystem & alternates
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "cool.fr.nf",
  "courriel.fr.nf",
  "moncourrier.fr.nf",
  "monemail.fr.nf",
  "monmail.fr.nf",
  "hide.biz.st",
  "mymail.infos.st",
  "zillamail.com",
  "mega.zik.dj",
  "speed.1s.fr",
  "nym.pals.fr",
  "cookie.mabox.eu",
  "yopmail.i-p-a.com",
  "yopmail.pp.ua",
  "yopmail.gq",
  "yopmail.cf",
  "yopmail.tk",
  "yopmail.ga",
  "yopmail.ml",

  // Mailinator ecosystem
  "mailinator.com",
  "mailinator2.com",
  "mailinater.com",
  "suremail.info",
  "spamherelots.com",
  "binkmail.com",
  "safetymail.info",
  "tradermail.info",
  "zippymail.info",
  "mailinator.net",
  "mailinator.org",
  "mailnull.com",
  "reconmail.com",
  "mail-temporaire.fr",

  // Guerrilla Mail ecosystem
  "guerrillamail.com",
  "guerrillamail.biz",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.de",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "pokemail.net",
  "spam4.me",

  // 10 Minute Mail & variants
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.org",
  "10minutemail.co.uk",
  "10minutemail.be",
  "10minutemail.cf",
  "10minutemail.ga",
  "10minutemail.gq",
  "10minutemail.ml",
  "10minuteemail.com",
  "10mail.org",
  "10minemail.com",
  "minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "tempmail.net",
  "tempmail.dev",
  "tempmail.io",
  "temp-mail.io",
  "temp-mail.ru",
  "tempail.com",

  // TrashMail & Discard
  "trashmail.com",
  "trashmail.net",
  "trashmail.me",
  "trashmail.at",
  "trashmail.io",
  "dispostable.com",
  "discard.email",
  "discardmail.com",
  "discardmail.de",
  "spambog.com",
  "spambog.de",
  "spambog.ru",

  // Nada & GetNada
  "nada.ltd",
  "getnada.com",
  "abyssmail.com",
  "boximail.com",
  "clrmail.com",
  "dropmail.me",
  "inboxbear.com",
  "givmail.com",
  "inboxkitten.com",
  "tafmail.com",
  "vomoto.com",
  "zetmail.com",

  // FakeInbox & Email Generators
  "fakeinbox.com",
  "fakemailgenerator.com",
  "throwawaymail.com",
  "burnermail.io",
  "burner.kiwi",
  "maildrop.cc",
  "mohmal.com",
  "mohmal.in",
  "mohmal.im",
  "emailondeck.com",
  "crazymailing.com",
  "generator.email",
  "mailnesia.com",
  "getairmail.com",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "einrot.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
  "trbvm.com",
  "emailfake.com",
  "inboxalias.com",
  "mytemp.email",
  "mytempemail.com",
  "zillamail.info",
  "tmpbox.net",
  "tmpmail.net",
  "tmpmail.org",
  "jetable.org",
  "fastmailtemp.com",
  "tempinbox.com",
  "spambox.us",
  "kasmail.com",
  "meltmail.com",
  "mailcatch.com",
  "spamfree24.org",
  "incognitomail.org",
  "anonymbox.com",
]);

// Dynamic import or load from disposable-email-domains package if present
let packageDomainsSet: Set<string> | null = null;
try {
  // eslint-disable-next-line
  const pkgList = require("disposable-email-domains");
  if (Array.isArray(pkgList)) {
    packageDomainsSet = new Set(pkgList.map((d: string) => d.toLowerCase().trim()));
  }
} catch {
  // Fallback to static lists
}

/**
 * Extracts normalized domain from an email string.
 */
export function extractDomain(email: string): string {
  if (!email || typeof email !== "string") return "";
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length < 2) return "";
  return parts[parts.length - 1].trim();
}

/**
 * Checks if an email belongs to a disposable / temporary email service.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  
  const domain = extractDomain(email);
  if (!domain) return false;

  // 1. Direct match in popular domains list
  if (POPULAR_DISPOSABLE_DOMAINS.has(domain)) {
    return true;
  }

  // 2. Direct match in extended package domains list (3,000+ domains)
  if (packageDomainsSet && packageDomainsSet.has(domain)) {
    return true;
  }

  // 3. Subdomain check (e.g. user@abc.yopmail.com -> abc.yopmail.com -> yopmail.com)
  const domainParts = domain.split(".");
  if (domainParts.length > 2) {
    const rootDomain = domainParts.slice(-2).join(".");
    if (POPULAR_DISPOSABLE_DOMAINS.has(rootDomain)) {
      return true;
    }
    if (packageDomainsSet && packageDomainsSet.has(rootDomain)) {
      return true;
    }
  }

  // 4. Keyword/Pattern check in the domain name
  for (const keyword of DISPOSABLE_KEYWORDS) {
    if (domain.includes(keyword)) {
      return true;
    }
  }

  return false;
}

export const BLOCKED_EMAIL_MESSAGE =
  "Temporary and disposable email addresses (such as Yopmail, Mailinator, TempMail, etc.) are blocked and suspended from accessing NeuralDesk. Please use your authentic work or personal email address.";

/**
 * Returns an error message if the email is disposable, or null if it is allowed.
 */
export function getDisposableEmailError(email: string): string | null {
  if (isDisposableEmail(email)) {
    return BLOCKED_EMAIL_MESSAGE;
  }
  return null;
}

/**
 * Validates an email address format and checks that it is not disposable.
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return { isValid: false, error: "Email address is required." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: "Please enter a valid email address." };
  }

  if (isDisposableEmail(email)) {
    return { isValid: false, error: BLOCKED_EMAIL_MESSAGE };
  }

  return { isValid: true };
}
