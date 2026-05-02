import { Text, View } from "@react-pdf/renderer";
import { styles } from "./styles";
import { formatAbn, formatAddressLine, type UserProfile } from "@/lib/user-profile";

// Right-aligned agency block at the top of every PDF. Falls back to the
// account name/email when the profile is empty.
export function AgencyBlock({
  profile,
  fallbackName,
  fallbackEmail,
}: {
  profile: UserProfile;
  fallbackName: string | null;
  fallbackEmail: string;
}) {
  const name = profile.business_name ?? fallbackName ?? fallbackEmail;
  const lines = [
    formatAddressLine(profile),
    profile.phone,
    profile.website,
    fallbackEmail,
    profile.abn ? `ABN ${formatAbn(profile.abn)}` : null,
  ].filter((s): s is string => Boolean(s));

  return (
    <View style={styles.agencyBlock}>
      <Text style={styles.agencyName}>{name}</Text>
      {lines.map((line, i) => (
        <Text key={i} style={styles.agencyLine}>
          {line}
        </Text>
      ))}
    </View>
  );
}
