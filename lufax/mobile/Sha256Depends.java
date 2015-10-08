// import android.support.v4.view.accessibility.AccessibilityNodeInfoCompat;
// import com.tencent.mm.sdk.platformtools.Util;
// import com.tendcloud.tenddata.C2841c;
// import common.security.Base64;
import org.apache.commons.codec.binary.StringUtils;

/* renamed from: com.lufax.android.invitation.a.a */
//C1765a
public class Sha256Depends extends Sha256DependsBase {
    static final byte[] f7442a;
    private static final byte[] f7443i;
    private static final byte[] f7444j;
    private static final byte[] f7445k;
    private final byte[] f7446l;
    private final byte[] f7447m;
    private final byte[] f7448n;
    private final int f7449o;
    private final int f7450p;
    private int f7451q;

    static {
        f7442a = new byte[]{(byte) 13, (byte) 10};
        f7443i = new byte[]{(byte) 65, (byte) 66, (byte) 67, (byte) 68, (byte) 69, (byte) 70, (byte) 71, (byte) 72, (byte) 73, (byte) 74, (byte) 75, (byte) 76, (byte) 77, (byte) 78, (byte) 79, (byte) 80, (byte) 81, (byte) 82, (byte) 83, (byte) 84, (byte) 85, (byte) 86, (byte) 87, (byte) 88, (byte) 89, (byte) 90, (byte) 97, (byte) 98, (byte) 99, (byte) 100, (byte) 101, (byte) 102, (byte) 103, (byte) 104, (byte) 105, (byte) 106, (byte) 107, (byte) 108, (byte) 109, (byte) 110, (byte) 111, (byte) 112, (byte) 113, (byte) 114, (byte) 115, (byte) 116, (byte) 117, (byte) 118, (byte) 119, (byte) 120, (byte) 121, (byte) 122, (byte) 48, (byte) 49, (byte) 50, (byte) 51, (byte) 52, (byte) 53, (byte) 54, (byte) 55, (byte) 56, (byte) 57, (byte) 43, (byte) 47};
        f7444j = new byte[]{(byte) 65, (byte) 66, (byte) 67, (byte) 68, (byte) 69, (byte) 70, (byte) 71, (byte) 72, (byte) 73, (byte) 74, (byte) 75, (byte) 76, (byte) 77, (byte) 78, (byte) 79, (byte) 80, (byte) 81, (byte) 82, (byte) 83, (byte) 84, (byte) 85, (byte) 86, (byte) 87, (byte) 88, (byte) 89, (byte) 90, (byte) 97, (byte) 98, (byte) 99, (byte) 100, (byte) 101, (byte) 102, (byte) 103, (byte) 104, (byte) 105, (byte) 106, (byte) 107, (byte) 108, (byte) 109, (byte) 110, (byte) 111, (byte) 112, (byte) 113, (byte) 114, (byte) 115, (byte) 116, (byte) 117, (byte) 118, (byte) 119, (byte) 120, (byte) 121, (byte) 122, (byte) 48, (byte) 49, (byte) 50, (byte) 51, (byte) 52, (byte) 53, (byte) 54, (byte) 55, (byte) 56, (byte) 57, (byte) 45, (byte) 95};
        f7445k = new byte[]{(byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) 62, (byte) -1, (byte) 62, (byte) -1, (byte) 63, (byte) 52, (byte) 53, (byte) 54, (byte) 55, (byte) 56, (byte) 57, (byte) 58, (byte) 59, (byte) 60, (byte) 61, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) 0, (byte) 1, (byte) 2, (byte) 3, (byte) 4, (byte) 5, (byte) 6, (byte) 7, (byte) 8, (byte) 9, (byte) 10, (byte) 11, (byte) 12, (byte) 13, (byte) 14, (byte) 15, (byte) 16, (byte) 17, (byte) 18, (byte) 19, (byte) 20, (byte) 21, (byte) 22, (byte) 23, (byte) 24, (byte) 25, (byte) -1, (byte) -1, (byte) -1, (byte) -1, (byte) 63, (byte) -1, (byte) 26, (byte) 27, (byte) 28, (byte) 29, (byte) 30, (byte) 31, (byte) 32, (byte) 33, (byte) 34, (byte) 35, (byte) 36, (byte) 37, (byte) 38, (byte) 39, (byte) 40, (byte) 41, (byte) 42, (byte) 43, (byte) 44, (byte) 45, (byte) 46, (byte) 47, (byte) 48, (byte) 49, (byte) 50, (byte) 51};
    }

    public Sha256Depends() {
        this(0);
    }

    public Sha256Depends(int i) {
        this(i, f7442a);
    }

    public Sha256Depends(int i, byte[] bArr) {
        this(i, bArr, false);
    }

    public Sha256Depends(int i, byte[] bArr, boolean z) {
        super(3, 4, i, bArr == null ? 0 : bArr.length);
        this.f7447m = f7445k;
        if (bArr == null) {
            this.f7450p = 4;
            this.f7448n = null;
        } else if (m9289c(bArr)) {
            throw new IllegalArgumentException("lineSeparator must not contain base64 characters: [" + StringUtils.newStringUtf8(bArr) + "]");
        } else if (i > 0) {
            this.f7450p = bArr.length + 4;
            this.f7448n = new byte[bArr.length];
            System.out.println("System.arraycopy...444");
            System.arraycopy(bArr, 0, this.f7448n, 0, bArr.length);
        } else {
            this.f7450p = 4;
            this.f7448n = null;
        }
        this.f7449o = this.f7450p - 1;
        this.f7446l = z ? f7444j : f7443i;
    }

    public Sha256Depends(boolean z) {
        this(76, f7442a, z);
    }

    public static String m9291a(byte[] bArr) {
        System.out.println("---==="+bArr.length+" "+StringUtils.newStringUtf8(bArr));
        System.out.println(bArr.length + " 0:"+ bArr[0]+" 1:"+bArr[1]+" 2:"+bArr[2]+" 3:"+bArr[3]+" 4:"+bArr[4]+" 5:"+bArr[5]+" 6:"+bArr[6]);
        return StringUtils.newStringUtf8(Sha256Depends.m9292a(bArr, false));
    }

    public static byte[] m9292a(byte[] bArr, boolean z) {
        return Sha256Depends.m9293a(bArr, z, false);
    }

    public static byte[] m9293a(byte[] bArr, boolean z, boolean z2) {
        return Sha256Depends.m9294a(bArr, z, z2, Integer.MAX_VALUE);
    }

    public static byte[] m9294a(byte[] bArr, boolean z, boolean z2, int i) {
        if (bArr == null || bArr.length == 0) {
            return bArr;
        }
        Sha256Depends sha256Depends = z ? new Sha256Depends(z2) : new Sha256Depends(0, f7442a, z2);
        long d = sha256Depends.m9290d(bArr);
        System.out.println("------d:"+ d + " "+bArr[0]+" "+bArr[1]);
        
        if (d <= ((long) i)) {
            return sha256Depends.encode(bArr);
        }
        throw new IllegalArgumentException("Input array too big, the output array would be bigger (" + d + ") than the specified maximum size of " + i);
    }

    public static String m9295b(byte[] bArr) {
        return StringUtils.newStringUtf8(Sha256Depends.m9293a(bArr, false, true));
    }

    void m9283a(byte[] bArr, int i, int i2) {//was m9296a
        if (!this.f7436f) {
            int i3;
            int i4;
            if (i2 < 0) {
                this.f7436f = true;
                if (this.f7438h != 0 || this.f7433c != 0) {
                    this.m9282a(this.f7450p);
                    i3 = this.f7435e;
                    byte[] bArr2;
                    switch (this.f7438h) {
                        // case Base64.NO_PADDING /*1*/:
                        case 1:
                            bArr2 = this.f7434d;
                            i4 = this.f7435e;
                            this.f7435e = i4 + 1;
                            bArr2[i4] = this.f7446l[(this.f7451q >> 2) & 63];
                            bArr2 = this.f7434d;
                            i4 = this.f7435e;
                            this.f7435e = i4 + 1;
                            bArr2[i4] = this.f7446l[(this.f7451q << 4) & 63];
                            if (this.f7446l == f7443i) {
                                bArr2 = this.f7434d;
                                i4 = this.f7435e;
                                this.f7435e = i4 + 1;
                                bArr2[i4] = (byte) 61;
                                bArr2 = this.f7434d;
                                i4 = this.f7435e;
                                this.f7435e = i4 + 1;
                                bArr2[i4] = (byte) 61;
                                break;
                            }
                            break;
                        // case Base64.NO_WRAP /*2*/:
                        case 2:
                            bArr2 = this.f7434d;
                            i4 = this.f7435e;
                            this.f7435e = i4 + 1;
                            bArr2[i4] = this.f7446l[(this.f7451q >> 10) & 63];
                            bArr2 = this.f7434d;
                            i4 = this.f7435e;
                            this.f7435e = i4 + 1;
                            bArr2[i4] = this.f7446l[(this.f7451q >> 4) & 63];
                            bArr2 = this.f7434d;
                            i4 = this.f7435e;
                            this.f7435e = i4 + 1;
                            bArr2[i4] = this.f7446l[(this.f7451q << 2) & 63];
                            if (this.f7446l == f7443i) {
                                bArr2 = this.f7434d;
                                i4 = this.f7435e;
                                this.f7435e = i4 + 1;
                                bArr2[i4] = (byte) 61;
                                break;
                            }
                            break;
                    }
                    this.f7437g = (this.f7435e - i3) + this.f7437g;
                    if (this.f7433c > 0 && this.f7437g > 0) {
                        System.out.println("System.arraycopy222...");
                        System.arraycopy(this.f7448n, 0, this.f7434d, this.f7435e, this.f7448n.length);
                        this.f7435e += this.f7448n.length;
                        return;
                    }
                    return;
                }
                return;
            }
            int i5 = 0;
            while (i5 < i2) {
                this.m9282a(this.f7450p);
                this.f7438h = (this.f7438h + 1) % 3;
                i4 = i + 1;
                i3 = bArr[i];
                if (i3 < 0) {
                    i3 += 256;
                }
                this.f7451q = i3 + (this.f7451q << 8);
                if (this.f7438h == 0) {
                    byte[] bArr3 = this.f7434d;
                    int i6 = this.f7435e;
                    this.f7435e = i6 + 1;
                    bArr3[i6] = this.f7446l[(this.f7451q >> 18) & 63];
                    bArr3 = this.f7434d;
                    i6 = this.f7435e;
                    this.f7435e = i6 + 1;
                    bArr3[i6] = this.f7446l[(this.f7451q >> 12) & 63];
                    bArr3 = this.f7434d;
                    i6 = this.f7435e;
                    this.f7435e = i6 + 1;
                    bArr3[i6] = this.f7446l[(this.f7451q >> 6) & 63];
                    bArr3 = this.f7434d;
                    i6 = this.f7435e;
                    this.f7435e = i6 + 1;
                    bArr3[i6] = this.f7446l[this.f7451q & 63];
                    this.f7437g += 4;
                    if (this.f7433c > 0 && this.f7433c <= this.f7437g) {
                        System.out.println("System.arraycopy...333");
                        System.arraycopy(this.f7448n, 0, this.f7434d, this.f7435e, this.f7448n.length);
                        this.f7435e += this.f7448n.length;
                        this.f7437g = 0;
                    }
                }
                i5++;
                i = i4;
            }
        }
    }

    protected boolean m9284a(byte b) {
        return b >= 0 && b < this.f7447m.length && this.f7447m[b] != -1;
    }

    void m9287b(byte[] bArr, int i, int i2) {//was m9298b
        if (!this.f7436f) {
            int i3;
            if (i2 < 0) {
                this.f7436f = true;
            }
            int i4 = 0;
            while (i4 < i2) {
                this.m9282a(this.f7449o);
                i3 = i + 1;
                byte b = bArr[i];
                if (b == 61) {
                    this.f7436f = true;
                    break;
                }
                if (b >= 0 && b < f7445k.length) {
                    b = f7445k[b];
                    if (b >= 0) {
                        this.f7438h = (this.f7438h + 1) % 4;
                        this.f7451q = b + (this.f7451q << 6);
                        if (this.f7438h == 0) {
                            byte[] bArr2 = this.f7434d;
                            int i5 = this.f7435e;
                            this.f7435e = i5 + 1;
                            bArr2[i5] = (byte) ((this.f7451q >> 16) & 255);
                            bArr2 = this.f7434d;
                            i5 = this.f7435e;
                            this.f7435e = i5 + 1;
                            bArr2[i5] = (byte) ((this.f7451q >> 8) & 255);
                            bArr2 = this.f7434d;
                            i5 = this.f7435e;
                            this.f7435e = i5 + 1;
                            bArr2[i5] = (byte) (this.f7451q & 255);
                        }
                    }
                }
                i4++;
                i = i3;
            }
            if (this.f7436f && this.f7438h != 0) {
                this.m9282a(this.f7449o);
                byte[] bArr3;
                switch (this.f7438h) {
                    // case Base64.NO_WRAP /*2*/:
                    case 2:
                        this.f7451q >>= 4;
                        bArr3 = this.f7434d;
                        i3 = this.f7435e;
                        this.f7435e = i3 + 1;
                        bArr3[i3] = (byte) (this.f7451q & 255);
                    // case C2841c.f10678f /*3*/:
                    case 3:
                        this.f7451q >>= 2;
                        bArr3 = this.f7434d;
                        i3 = this.f7435e;
                        this.f7435e = i3 + 1;
                        bArr3[i3] = (byte) ((this.f7451q >> 8) & 255);
                        bArr3 = this.f7434d;
                        i3 = this.f7435e;
                        this.f7435e = i3 + 1;
                        bArr3[i3] = (byte) (this.f7451q & 255);
                    default:
                }
            }
        }
    }
}
