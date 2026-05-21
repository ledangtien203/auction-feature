import { Shield, Zap, TrendingUp, Users, Award, Globe } from 'lucide-react';

export function About() {
  return (
    <div>
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Về chúng tôi</h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Nền tảng đấu giá trực tuyến hàng đầu Việt Nam, mang đến trải nghiệm đấu giá minh bạch,
              an toàn và hiện đại nhất
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 bg-accent/10 rounded-2xl mb-6">
                <Award className="h-7 w-7 text-accent" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Sứ mệnh</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Chúng tôi cam kết tạo ra một nền tảng đấu giá công bằng, minh bạch, nơi mọi người có
                thể tìm kiếm và sở hữu những sản phẩm chất lượng cao với giá trị tốt nhất. Sứ mệnh
                của chúng tôi là xây dựng niềm tin và mang lại trải nghiệm tuyệt vời cho từng khách
                hàng.
              </p>
            </div>

            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 bg-accent/10 rounded-2xl mb-6">
                <Globe className="h-7 w-7 text-accent" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Tầm nhìn</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Trở thành nền tảng đấu giá trực tuyến số 1 tại Việt Nam và mở rộng ra khu vực Đông
                Nam Á, được biết đến với sự đổi mới công nghệ, dịch vụ khách hàng xuất sắc và danh
                mục sản phẩm đa dạng, phục vụ hàng triệu người dùng mỗi năm.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Giá trị cốt lõi</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Những nguyên tắc định hướng mọi hoạt động của chúng tôi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background border border-border rounded-2xl p-8 hover:border-accent transition-colors">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-accent/10 rounded-2xl mb-6">
                <Shield className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">An toàn & Minh bạch</h3>
              <p className="text-muted-foreground leading-relaxed">
                Mọi giao dịch được bảo mật tuyệt đối. Quy trình đấu giá rõ ràng, công khai, đảm bảo
                quyền lợi cho tất cả người tham gia.
              </p>
            </div>

            <div className="bg-background border border-border rounded-2xl p-8 hover:border-accent transition-colors">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-accent/10 rounded-2xl mb-6">
                <Zap className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Công nghệ tiên tiến</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ứng dụng công nghệ hiện đại nhất để mang lại trải nghiệm đấu giá mượt mà, tức thời
                và thuận tiện trên mọi thiết bị.
              </p>
            </div>

            <div className="bg-background border border-border rounded-2xl p-8 hover:border-accent transition-colors">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-accent/10 rounded-2xl mb-6">
                <TrendingUp className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Chất lượng đảm bảo</h3>
              <p className="text-muted-foreground leading-relaxed">
                100% sản phẩm được xác thực nguồn gốc và kiểm định chất lượng nghiêm ngặt trước khi
                đưa lên đấu giá.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Thành tựu của chúng tôi</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Con số minh chứng cho sự phát triển và niềm tin từ khách hàng
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-4">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <div className="text-4xl font-bold mb-2 text-accent">5,000+</div>
              <div className="text-muted-foreground">Thành viên tích cực</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-4">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <div className="text-4xl font-bold mb-2 text-accent">12,000+</div>
              <div className="text-muted-foreground">Đấu giá thành công</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-4">
                <Award className="h-8 w-8 text-accent" />
              </div>
              <div className="text-4xl font-bold mb-2 text-accent">99%</div>
              <div className="text-muted-foreground">Khách hàng hài lòng</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-4">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <div className="text-4xl font-bold mb-2 text-accent">100%</div>
              <div className="text-muted-foreground">Giao dịch an toàn</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Đội ngũ của chúng tôi</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Những con người tâm huyết đằng sau sự thành công
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Nguyễn Văn A',
                role: 'CEO & Founder',
                description: '10+ năm kinh nghiệm trong lĩnh vực thương mại điện tử',
              },
              {
                name: 'Trần Thị B',
                role: 'CTO',
                description: 'Chuyên gia công nghệ với nhiều dự án thành công',
              },
              {
                name: 'Lê Văn C',
                role: 'Head of Operations',
                description: 'Đảm bảo vận hành trơn tru và hiệu quả',
              },
            ].map((member, index) => (
              <div
                key={index}
                className="bg-background border border-border rounded-2xl p-8 text-center hover:border-accent transition-colors"
              >
                <div className="w-24 h-24 rounded-full bg-accent/10 mx-auto mb-6 flex items-center justify-center">
                  <span className="text-3xl font-bold text-accent">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-accent font-medium mb-3">{member.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
