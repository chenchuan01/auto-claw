#!/bin/bash

# AutoX Task Manager 构建脚本
# 用于打包APK文件

set -e

echo "🚀 AutoX Task Manager 构建开始"

# 检查必要工具
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ 未找到 $1，请先安装"
        exit 1
    fi
}

echo "🔍 检查依赖工具..."
check_tool "node"
check_tool "npm"
check_tool "zip"

# 清理旧构建
echo "🧹 清理旧构建文件..."
rm -rf build/ dist/ *.apk *.zip 2>/dev/null || true

# 创建构建目录
echo "📁 创建构建目录..."
mkdir -p build/assets build/res build/lib

# 复制项目文件
echo "📋 复制项目文件..."
cp -r *.js ui/ core/ data/ build/
cp project.json build/
cp README.md build/
cp INSTALL.md build/

# 创建资源文件（占位符）
echo "🎨 创建资源文件..."
mkdir -p build/res/drawable build/res/mipmap

# 创建默认图标（使用文本图标）
echo "<?xml version=\"1.0\" encoding=\"utf-8\"?>" > build/res/drawable/ic_launcher.xml
echo "<vector xmlns:android=\"http://schemas.android.com/apk/res/android\"" >> build/res/drawable/ic_launcher.xml
echo "    android:width=\"108dp\"" >> build/res/drawable/ic_launcher.xml
echo "    android:height=\"108dp\"" >> build/res/drawable/ic_launcher.xml
echo "    android:viewportWidth=\"108\"" >> build/res/drawable/ic_launcher.xml
echo "    android:viewportHeight=\"108\">" >> build/res/drawable/ic_launcher.xml
echo "    <path" >> build/res/drawable/ic_launcher.xml
echo "        android:fillColor=\"#2196F3\"" >> build/res/drawable/ic_launcher.xml
echo "        android:pathData=\"M54,54m-50,0a50,50 0 1,1 100,0a50,50 0 1,1 -100,0\"/>" >> build/res/drawable/ic_launcher.xml
echo "    <path" >> build/res/drawable/ic_launcher.xml
echo "        android:fillColor=\"#FFFFFF\"" >> build/res/drawable/ic_launcher.xml
echo "        android:pathData=\"M40,40 L68,40 L68,68 L40,68 Z M44,44 L64,44 L64,48 L44,48 Z M44,52 L64,52 L64,56 L44,56 Z M44,60 L64,60 L64,64 L44,64 Z\"/>" >> build/res/drawable/ic_launcher.xml
echo "</vector>" >> build/res/drawable/ic_launcher.xml

# 创建AndroidManifest.xml
echo "📄 创建AndroidManifest.xml..."
cat > build/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.autox.taskmanager">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
        android:maxSdkVersion="28" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.ACCESS_NOTIFICATION_POLICY" />

    <application
        android:allowBackup="true"
        android:icon="@drawable/ic_launcher"
        android:label="AutoX Task Manager"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <service
            android:name=".TaskService"
            android:exported="false" />
            
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="com.autox.taskmanager.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>

</manifest>
EOF

# 创建构建配置
echo "⚙️ 创建构建配置..."
cat > build/build.gradle << 'EOF'
apply plugin: 'com.android.application'

android {
    compileSdkVersion 33
    defaultConfig {
        applicationId "com.autox.taskmanager"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            debuggable true
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
    
    // AutoX.js 运行时
    implementation 'com.github.hyb1996:Auto.js:7.0.4'
}
EOF

# 创建打包脚本
echo "📦 创建打包脚本..."
cat > build/package.sh << 'EOF'
#!/bin/bash
# 打包脚本 - 在build目录中运行

echo "开始打包APK..."
echo "请确保已安装Android SDK和Gradle"

# 检查gradle
if ! command -v gradle &> /dev/null; then
    echo "请先安装Gradle: https://gradle.org/install/"
    exit 1
fi

# 构建APK
gradle assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ APK构建成功!"
    echo "APK位置: app/build/outputs/apk/debug/app-debug.apk"
    echo "安装命令: adb install app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ APK构建失败"
    exit 1
fi
EOF

chmod +x build/package.sh

# 创建分发包
echo "📦 创建分发包..."
cd build
zip -r ../AutoXTaskManager_Source.zip .
cd ..

# 创建简易安装包（用于AutoX.js）
echo "📱 创建AutoX.js安装包..."
mkdir -p dist/AutoXTaskManager
cp -r *.js ui/ core/ data/ project.json README.md INSTALL.md dist/AutoXTaskManager/
cd dist
zip -r ../AutoXTaskManager_AutoX.zip AutoXTaskManager
cd ..

echo ""
echo "✅ 构建完成!"
echo ""
echo "📁 生成的文件:"
echo "  - AutoXTaskManager_Source.zip - 完整源代码包"
echo "  - AutoXTaskManager_AutoX.zip - AutoX.js安装包"
echo ""
echo "🚀 下一步:"
echo "  1. 将AutoXTaskManager_AutoX.zip导入AutoX.js直接运行"
echo "  2. 或使用build目录中的package.sh打包APK"
echo ""
echo "📱 安装方式详见: INSTALL.md"
echo ""