// import android.support.v4.view.accessibility.AccessibilityNodeInfoCompat;
import org.apache.commons.codec.BinaryDecoder;
import org.apache.commons.codec.BinaryEncoder;
import org.apache.commons.codec.DecoderException;
import org.apache.commons.codec.EncoderException;
import org.apache.commons.codec.binary.StringUtils;

/* renamed from: com.lufax.android.invitation.a.b */
//C1764b
public abstract class Sha256DependsBase  implements BinaryDecoder, BinaryEncoder {
    private final int f7431a;
    protected final byte f7432b;
    protected final int f7433c;
    protected byte[] f7434d;
    protected int f7435e;
    protected boolean f7436f;
    protected int f7437g;
    protected int f7438h;
    private final int f7439i;
    private final int f7440j;
    private int f7441k;

    protected Sha256DependsBase(int i, int i2, int i3, int i4) {
        this.f7432b = (byte) 61;
        this.f7431a = i;
        this.f7439i = i2;
        int i5 = (i3 <= 0 || i4 <= 0) ? 0 : (i3 / i2) * i2;
        this.f7433c = i5;
        this.f7440j = i4;
    }

    private void m9279c() {
        if (this.f7434d == null) {
            this.f7434d = new byte[m9286b()];
            this.f7435e = 0;
            this.f7441k = 0;
            return;
        }
        byte obj[] = new byte[(this.f7434d.length * 2)];
        System.out.println("System.arraycopy...");
        System.arraycopy(this.f7434d, 0, obj, 0, this.f7434d.length);
        this.f7434d = obj;
    }

    private void m9280d() {
        this.f7434d = null;
        this.f7435e = 0;
        this.f7441k = 0;
        this.f7437g = 0;
        this.f7438h = 0;
        this.f7436f = false;
    }

    int m9281a() {
        return this.f7434d != null ? this.f7435e - this.f7441k : 0;
    }

    protected void m9282a(int i) {
        if (this.f7434d == null || this.f7434d.length < this.f7435e + i) {
            m9279c();
        }
    }

    abstract void m9283a(byte[] bArr, int i, int i2);

    protected abstract boolean m9284a(byte b);

    public byte[] m9285a(String str) {
        return decode(StringUtils.getBytesUtf8(str));
    }

    protected int m9286b() {
        return 8192;
    }

    abstract void m9287b(byte[] bArr, int i, int i2);

    int m9288c(byte[] bArr, int i, int i2) {
        if (this.f7434d == null) {
            return this.f7436f ? -1 : 0;
        } else {
            int min = Math.min(m9281a(), i2);
            System.out.println("System.arraycopy.111..");
            System.arraycopy(this.f7434d, this.f7441k, bArr, i, min);
            this.f7441k += min;
            if (this.f7441k < this.f7435e) {
                return min;
            }
            this.f7434d = null;
            return min;
        }
    }

    protected boolean m9289c(byte[] bArr) {
        if (bArr == null) {
            return false;
        }
        int i = 0;
        while (i < bArr.length) {
            if (61 == bArr[i] || m9284a(bArr[i])) {
                return true;
            }
            i++;
        }
        return false;
    }

    public long m9290d(byte[] bArr) {
        long length = ((long) (((bArr.length + this.f7431a) - 1) / this.f7431a)) * ((long) this.f7439i);
        System.out.println("lenght---" + length +" "+ bArr.length +" "+this.f7431a +" "+ this.f7439i+" => " +((long) (((bArr.length + this.f7431a) - 1) / this.f7431a)) +" "+  ((long) this.f7439i));
        return this.f7433c > 0 ? length + ((((((long) this.f7433c) + length) - 1) / ((long) this.f7433c)) * ((long) this.f7440j)) : length;
    }

    public Object decode(Object obj) throws DecoderException {
        if (obj instanceof byte[]) {
            return decode((byte[]) obj);
        }
        if (obj instanceof String) {
            return m9285a((String) obj);
        }
        throw new DecoderException("Parameter supplied to Base-N decode is not a byte[] or a String");
    }

    public byte[] decode(byte[] bArr) {
        m9280d();
        if (bArr == null || bArr.length == 0) {
            return bArr;
        }
        m9287b(bArr, 0, bArr.length);
        m9287b(bArr, 0, -1);
        bArr = new byte[this.f7435e];
        m9288c(bArr, 0, bArr.length);
        return bArr;
    }

    public Object encode(Object obj) throws EncoderException {
        if (obj instanceof byte[]) {
            return encode((byte[]) obj);
        }
        throw new EncoderException("Parameter supplied to Base-N encode is not a byte[]");
    }

    public byte[] encode(byte[] bArr) {
        m9280d();
        if (bArr == null || bArr.length == 0) {
            return bArr;
        }
        m9283a(bArr, 0, bArr.length);
        m9283a(bArr, 0, -1);
        bArr = new byte[(this.f7435e - this.f7441k)];
        m9288c(bArr, 0, bArr.length);
        return bArr;
    }
}
