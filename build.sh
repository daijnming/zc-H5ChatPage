CONF="WEB-INF/replace.conf"
JAR="WEB-INF/lib/replace.jar"
TYPE=
TEST=
DIRECTORY=
while [ $# -gt 0 ]
do
	case $1 in 
	-p )
	 	case $2 in
			wap )
				TYPE="wap"
			;;
			pc )
			;;
			*)
				echo "param must be wap or pc";
				exit 1;
			;;
		esac
	;;
	-t)
		TEST="-T"
	;;
	-d)
	     DIRECTORY=$2
	;;
	esac
	shift;
done
if [ "$TYPE"x = "wap"x ];then
	CONF="WEB-INF/replace-wap.conf"
	if [ "$DIRECTORY"x = ""x ];then
		DIRECTORY="wap"
	fi
	rm -rf "dist/"$DIRECTORY
	egrep  "url=" $CONF | sed 's`#dir#`'${DIRECTORY}'`' > ${CONF}_temp
	gulp production-wap -d $DIRECTORY
	if [ "$TEST"x = ""x ];then
		find dist/${DIRECTORY} -name "*.html" -type f | xargs -I {}  sh replace.sh {} $JAR ${CONF}_temp
		rm ${CONF}_temp
	fi
	rm -rf "./dist/"${DIRECTORY}"/images/static"
	cp -r wap/images/static dist/"${DIRECTORY}"/images
fi

