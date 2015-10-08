/* renamed from: com.lufax.android.util.c.b */
//was class C2164b
import java.util.Random;

public class Siggen {
    
     public static void main(String[] args) throws Exception {  
            //Siggen sig = new Siggen();
            //x-lufax-mobile-t: 1443018327858
            //x-lufax-mobile-t: 1443018369759
        //NZAIVWFU54AKC2ELPU/Y5XGPZS/2OFQABFQIOA8IVHBPF3IWY7KEUMAJ2DLQKMS=
        //BVEY9P8WCSAKC2ELPU/Y5XGPZS/2OFQA4KSUN88SCOBPF3IWY7KEUMAJ2DLQKMS=
        //{\"userId\":"
        //x-lufax-mobile-t: 1443018369935
        //x-lufax-mobile-signature: FSA6356RQNU5E2PWFSVRY0IKNMA8IHYQEBLR6X2V1O0TADQWNP0UVM0EJFN2C3B=
        //                                           F2UXTUCBW4U5E2PWFSVRY0IKNMA8IHYQY7GVN292KF0TADQWNP0UVM0EJFN2C3B=
        // luhuiqing userId=1770933
        String str = m11558a("{\"userId\":1770933,\"_t\":1443018369935}", "1|4" );

            // String str = m11558a("{\"_t\":1443018369935}", "1|4" );
            System.out.println(str);
    }

    public static String m11557a(String str) {
        return new StringBuilder(str).reverse().toString();
    }

    public static String m11558a(String str, String str2) {
        try {
            String i = Sha256.m11528i(str);
            System.out.println("***"+i);
            String str3 = i;
            for (String parseInt : str2.split("\\|")) {
                System.out.println("parseInt:"+parseInt);
                int parseInt2 = Integer.parseInt(parseInt);
                if (parseInt2 == 1) {
                    str3 = Siggen.m11559b(str3);
                }
                if (parseInt2 == 2) {
                    str3 = Siggen.m11560c(str3);
                }
                if (parseInt2 == 3) {
                    str3 = Siggen.m11557a(str3);
                }
                if (parseInt2 == 4) {
                    str3 = Siggen.m11561d(str3);
                }
                if (parseInt2 == 5) {
                    str3 = Siggen.m11562e(str3);
                }                
            }
            return str3.toUpperCase();
        } catch (Exception e) {
            return "";
        }
    }

    public static String m11559b(String str) {
        StringBuilder stringBuilder = new StringBuilder();
        Random random = new Random();
        int length = "abcdefghiklmnopqrstuvwxyz0123456789".length();
        for (int i = 0; i < 20; i++) {
            stringBuilder.append("abcdefghiklmnopqrstuvwxyz0123456789".charAt(random.nextInt(length)));
        }
        return stringBuilder.toString().concat(str);
    }

    public static String m11560c(String str) {
        StringBuilder stringBuilder = new StringBuilder();
        Random random = new Random();
        int length = "abcdefghiklmnopqrstuvwxyz0123456789".length();
        for (int i = 0; i < 20; i++) {
            stringBuilder.append("abcdefghiklmnopqrstuvwxyz0123456789".charAt(random.nextInt(length)));
        }
        return str.concat(stringBuilder.toString());
    }

    public static String m11561d(String str) {
        String str2 = "";
        String str3 = "";
        String str4 = str2;
        for (int i = 0; i < str.length(); i++) {
            if (i % 2 == 0) {
                str4 = str4.concat(String.valueOf(str.charAt(i)));
            } else {
                str3 = str3.concat(String.valueOf(str.charAt(i)));
            }
        }
        return str4.concat(str3);
    }

    public static String m11562e(String str) {
        String str2 = "";
        String str3 = "";
        String str4 = str2;
        for (int i = 0; i < str.length(); i++) {
            if (i % 2 == 1) {
                str4 = str4.concat(String.valueOf(str.charAt(i)));
            } else {
                str3 = str3.concat(String.valueOf(str.charAt(i)));
            }
        }
        return str4.concat(str3);
    }
}
