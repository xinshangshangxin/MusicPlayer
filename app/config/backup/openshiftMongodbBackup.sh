#!/bin/sh

branchName=$1
backupPassword=$2
backupDirPrefixes=$3

# mongodump备份文件执行路径
DUMP=mongodump
# 临时备份目录
OUT_DIR=$backupDirPrefixes""/mongod_back/mongod_bak_now
# 备份存放路径
TAR_DIR=$backupDirPrefixes""/mongod_back/git_back
# 获取当前系统时间
DATE=`date +%Y_%m_%d_%H_%M_%S`
# 路径判断
if [ ! -d "$OUT_DIR" ]; then
  mkdir -p "$OUT_DIR"
fi

if [ ! -d "$TAR_DIR" ]; then
  mkdir -p "$TAR_DIR"
fi

if [ ! -d "$OUT_DIR/$DATE" ]; then
    mkdir -p $OUT_DIR/$DATE
fi
# 数据库账号
#DB_USER=username
# 数据库密码
#DB_PASS=123456
# 最终保存的数据库备份文件名
TAR_BAK="mongod_bak_$DATE.tar.gz"
# 备份全部数据库
#$DUMP -u $DB_USER -p $DB_PASS -o $OUT_DIR/$DATE
# 备份全部数据库
$DUMP -h $OPENSHIFT_DIY_IP -o $OUT_DIR/$DATE
# 压缩为.tar.gz格式
# tar -zcvf $TAR_DIR/$TAR_BAK $OUT_DIR/$DATE
# 带密码压缩 (修改 filename 和 password)
#tar -zcvf - filename |openssl des3 -salt -k password | dd of=filename.des3
# 解压; 注意命令最后面的“-”  它将释放所有文件， -k password 可以没有，没有时在解压时会提示输入密码
#dd if=filename.des3 |openssl des3 -d -k password | tar zxf -
tar -zcvf - "$OUT_DIR/$DATE" |openssl des3 -salt -k $backupPassword | dd of="$TAR_DIR/$TAR_BAK.des3"


cd $TAR_DIR
git add -A
git commit -m "auto"
rm -rf mongod_bak_*
rm -rf ../mongod_bak_*
git push origin $branchName