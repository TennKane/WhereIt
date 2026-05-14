import { RegisterForm } from "@/components/forms/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="mx-auto mt-12 max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">注册</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            已有账号？{" "}
            <Link href="/login" className="text-primary hover:underline">
              登录
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
