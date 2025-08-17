import Image from "next/image";
import AuthButton from "@/components/AppButton";

export default function Home() {
  return (
    <main className="bg-gray-800 text-white min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-black py-4 px-8 flex justify-between items-center">
        <h1 className="text-xl font-bold">Lunari</h1>
        <AuthButton></AuthButton>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="max-w-lg">
            <p className="text-red-400 font-semibold mb-3">
              Giao tiếp. Học tập. Làm việc. Mọi lúc, mọi nơi.
            </p>
            <h2 className="text-4xl font-bold leading-snug mb-6">
              Lunari – nền tảng nhắn tin nhóm thế hệ mới
            </h2>
            <button className="bg-red-500 px-6 py-3 rounded-lg hover:bg-red-600 transition">
              Đăng ký ngay
            </button>
          </div>
          <Image
            src="/images/hero.png"
            alt="Hero"
            width={500}
            height={320}
            className="rounded-lg object-cover"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-gray-700">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <Image
            src="/images/team.png"
            alt="Group"
            width={500}
            height={320}
            className="rounded-lg object-cover"
          />
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-2">
                Nhắn tin nhóm & phòng thoại
              </h3>
              <p className="text-gray-300">
                Giao tiếp theo thời gian thực với nhắn tin, tin nhắn thoại, và
                phòng thoại.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">
                Mời thành viên bằng liên kết
              </h3>
              <p className="text-gray-300">
                Chia sẻ dễ dàng bằng liên kết & QR, giúp mọi người vào nhóm
                nhanh chóng.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">
                Quản lý quyền & vai trò
              </h3>
              <p className="text-gray-300">
                Phân quyền chi tiết, quản lý vai trò và quyền hạn thành viên.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">
                Cá nhân hóa & đổi theme
              </h3>
              <p className="text-gray-300">
                Tùy biến giao diện, đổi theme cho trải nghiệm sử dụng riêng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section className="bg-gray-900 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-2xl font-bold mb-10">
            Đăng ký để trải nghiệm Lunari
          </h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Tên người dùng"
              className="p-3 rounded-md bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <input
              type="email"
              placeholder="Email"
              className="p-3 rounded-md bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              className="p-3 rounded-md bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400 md:col-span-2"
            />
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 p-3 rounded-md font-bold md:col-span-2"
            >
              Tạo tài khoản
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-6 px-8 flex justify-between text-sm">
        <p>
          Lunari - nền tảng để giao tiếp, học tập và giao lưu mọi lúc, mọi nơi.
        </p>
        <a href="#" className="hover:underline">
          Navigation
        </a>
      </footer>
    </main>
  );
}
