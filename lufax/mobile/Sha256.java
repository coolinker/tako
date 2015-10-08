// import android.text.TextUtils;
// import com.lufax.android.invitation.p127a.C1765a;
// import com.lufax.android.util.C2187y;
// import com.pingan.anydoor.module.msgcenter.module.MsgCenterConstants;
// import com.tencent.mm.sdk.contact.RContactStorage;
// import common.security.Base64;
// import java.math.BigDecimal;
import java.security.MessageDigest;
// import java.text.DecimalFormat;
// import java.util.Calendar;
// import java.util.TimeZone;
// import java.util.regex.Pattern;
import org.apache.commons.codec.digest.MessageDigestAlgorithms;
// import p000a.p001a.p002a.C0009e;
// import p000a.p001a.p002a.p003a.C0001a;
// import p000a.p001a.p002a.p003a.C0002b;
// import p000a.p001a.p002a.p003a.C0003c;
// import p000a.p001a.p002a.p003a.p004a.C0000a;

/* renamed from: com.lufax.android.util.b.h */
//was class C2159h
public class Sha256 {
    // public static double m11514a(String str) {
    //     try {
    //         return Double.parseDouble(str);
    //     } catch (Exception e) {
    //         return -1.0d;
    //     }
    // }

    // public static String m11515a(long j) {
    //     long j2 = j / 3600;
    //     long j3 = ((j % 86400) % 3600) / 60;
    //     long j4 = (((j % 86400) % 3600) % 60) / 1;
    //     return ((RContactStorage.PRIMARY_KEY + (j2 < 10 ? MsgCenterConstants.TYPE_ALL + j2 + "\u65f6" : j2 + "\u65f6")) + (j3 < 10 ? MsgCenterConstants.TYPE_ALL + j3 + "\u5206" : j3 + "\u5206")) + (j4 < 10 ? MsgCenterConstants.TYPE_ALL + j4 + "\u79d2" : j4 + "\u79d2");
    // }

    // public static String m11516a(String str, int i) {
    //     String str2 = RContactStorage.PRIMARY_KEY;
    //     if (C2159h.m11522c(str)) {
    //         return RContactStorage.PRIMARY_KEY;
    //     }
    //     str2 = "#.00";
    //     switch (i) {
    //         case Base64.CRLF /*4*/:
    //             str2 = "#.0000";
    //             break;
    //     }
    //     str2 = new DecimalFormat(str2).format(Double.valueOf(str));
    //     return str2.startsWith(".") ? MsgCenterConstants.TYPE_ALL + str2 : str2;
    // }

    // public static String m11517a(String str, boolean z) {
    //     String str2 = MsgCenterConstants.TYPE_ALL;
    //     if (C2159h.m11522c(str)) {
    //         return str2;
    //     }
    //     if (str.toUpperCase().indexOf("E") > -1) {
    //         str = new BigDecimal(str).toPlainString();
    //     }
    //     int indexOf = str.indexOf(".");
    //     if (indexOf <= -1) {
    //         return C2159h.m11521b(str, RContactStorage.PRIMARY_KEY);
    //     }
    //     String[] split = str.split("\\.");
    //     return z ? C2159h.m11521b(split[0], RContactStorage.PRIMARY_KEY) + str.substring(indexOf) : C2159h.m11521b(split[0], RContactStorage.PRIMARY_KEY);
    // }

    // public static Calendar m11518a() {
    //     return Calendar.getInstance(TimeZone.getTimeZone("Asia/Shanghai"));
    // }

    // public static boolean m11519a(String str, String str2) {
    //     return (str == null || str2 == null || !str.equals(str2)) ? false : true;
    // }

    // public static String m11520b(String str) {
    //     return str == null ? str : str.replace("\\", "\\\\").replace("'", "\\'");
    // }

    // private static String m11521b(String str, String str2) {
    //     return str.length() > 3 ? C2159h.m11521b(str.substring(0, str.length() - 3), "," + str.substring(str.length() - 3, str.length()) + str2) : str + str2;
    // }

    // public static boolean m11522c(String str) {
    //     return str == null || str.length() == 0;
    // }

    // public static Calendar m11523d(String str) {
    //     if (TextUtils.isEmpty(str) || str.length() < 8) {
    //         return null;
    //     }
    //     StringBuilder stringBuilder = new StringBuilder(str);
    //     while (str.length() < 14) {
    //         stringBuilder.append(MsgCenterConstants.TYPE_ALL);
    //     }
    //     String stringBuilder2 = stringBuilder.toString();
    //     Calendar a = C2159h.m11518a();
    //     a.set(C2159h.m11524e(stringBuilder2.substring(0, 4)), C2159h.m11524e(stringBuilder2.substring(4, 6)) - 1, C2159h.m11524e(stringBuilder2.substring(6, 8)), C2159h.m11524e(stringBuilder2.substring(8, 10)), C2159h.m11524e(stringBuilder2.substring(10, 12)), stringBuilder2.length() >= 14 ? C2159h.m11524e(stringBuilder2.substring(12, 14)) : 0);
    //     a.set(14, 0);
    //     return a;
    // }

    // public static int m11524e(String str) {
    //     try {
    //         return Integer.parseInt(str);
    //     } catch (Exception e) {
    //         return -1;
    //     }
    // }

    // public static String m11525f(String str) {
    //     String str2 = RContactStorage.PRIMARY_KEY;
    //     char charAt = str.charAt(0);
    //     String[] a = C0009e.m18a(charAt);
    //     Object obj = a != null ? str2 + a[0].charAt(0) : str2 + charAt;
    //     return Pattern.compile("[a-zA-Z]").matcher(obj).matches() ? obj.toUpperCase() : "|";
    // }

    // public static String m11526g(String str) {
    //     if (TextUtils.isEmpty(str)) {
    //         return RContactStorage.PRIMARY_KEY;
    //     }
    //     StringBuffer stringBuffer = new StringBuffer();
    //     char[] toCharArray = str.toCharArray();
    //     C0002b c0002b = new C0002b();
    //     c0002b.m2a(C0001a.f1b);
    //     c0002b.m3a(C0003c.f7b);
    //     for (int i = 0; i < toCharArray.length; i++) {
    //         C2187y.m11595a("NEVER", String.valueOf(toCharArray[i]));
    //         if (toCharArray[i] > '\u0080') {
    //             try {
    //                 String[] a = C0009e.m19a(toCharArray[i], c0002b);
    //                 if (a != null) {
    //                     stringBuffer.append(a[0].charAt(0));
    //                 }
    //             } catch (C0000a e) {
    //                 e.printStackTrace();
    //             }
    //         } else {
    //             stringBuffer.append(toCharArray[i]);
    //         }
    //     }
    //     return stringBuffer.toString().toLowerCase().trim();
    // }

    // public static String m11527h(String str) {
    //     String str2 = RContactStorage.PRIMARY_KEY;
    //     try {
    //         if (!TextUtils.isEmpty(str)) {
    //             byte[] bytes = str.getBytes();
    //             MessageDigest instance = MessageDigest.getInstance(MessageDigestAlgorithms.SHA_256);
    //             if (instance != null) {
    //                 str2 = Sha256Depends.m9295b(instance.digest(bytes));
    //             }
    //         }
    //     } catch (Exception e) {
    //         e.printStackTrace();
    //     }
    //     return str2;
    // }

    public static String m11528i(String str) {
        String str2 = "";//RContactStorage.PRIMARY_KEY;
        try {
            
            byte[] bytes = str.getBytes();
            System.out.println("bytes "+bytes.length+" "+str);
            MessageDigest instance = MessageDigest.getInstance(MessageDigestAlgorithms.SHA_256);
            return instance != null ? Sha256Depends.m9291a(instance.digest(bytes)) : str2;
            // return instance != null ? a.a(instance.digest(bytes)) : str2;
        } catch (Exception e) {
            e.printStackTrace();
            return "";//RContactStorage.PRIMARY_KEY;
        }
    }

    // public static boolean m11529j(String str) {
    //     if (TextUtils.isEmpty(str)) {
    //         return false;
    //     }
    //     String str2 = "0123456789";
    //     String str3 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    //     String str4 = ",./;'<>?:\"[]\\{}|~!@#$%^&*()-=+`_";
    //     int i = 0;
    //     int i2 = 0;
    //     int i3 = 0;
    //     for (int i4 = 0; i4 < str.length(); i4++) {
    //         if (str2.indexOf(str.charAt(i4)) > -1) {
    //             i3 = 1;
    //         } else if (str3.indexOf(str.charAt(i4)) > -1) {
    //             i2 = 1;
    //         } else if (str4.indexOf(str.charAt(i4)) <= -1) {
    //             return false;
    //         } else {
    //             i = 1;
    //         }
    //     }
    //     return (i3 + i2) + i >= 2;
    // }

    // public static String m11530k(String str) {
    //     return C2159h.m11517a(str, true);
    // }

    // public static String m11531l(String str) {
    //     return C2159h.m11522c(str) ? RContactStorage.PRIMARY_KEY : str.replaceAll(",", RContactStorage.PRIMARY_KEY).replaceAll("^0+", RContactStorage.PRIMARY_KEY);
    // }
}
