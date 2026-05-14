import { LoginForm } from "@/components/forms/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto mt-12 max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">登录</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            还没有账号？{" "}
            <Link href="/register" className="text-primary hover:underline">
              注册
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
