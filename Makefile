# Knowlesail Makefile

.PHONY: install dev build preview install-capacitor sync-android open-android run-android build-apk

# 安装依赖
install:
	pnpm install

# 运行开发服务器
dev:
	pnpm run dev

# 构建生产版本
build:
	pnpm run build

# 预览构建版本
preview:
	pnpm run preview

# 安装 Capacitor 依赖
install-capacitor:
	pnpm add @capacitor/core @capacitor/cli @capacitor/android

# 同步安卓项目
sync-android:
	npx cap sync android

# 打开安卓项目
open-android:
	npx cap open android

# 运行安卓项目
run-android:
	pnpm run build && npx cap sync android && npx cap run android

# 构建 APK
build-apk:
	cd android && gradlew.bat assembleRelease && copy app\build\outputs\apk\release\app-release.apk ..
