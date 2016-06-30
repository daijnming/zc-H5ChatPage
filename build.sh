CONF="WEB-INF/replace.conf"
JAR="WEB-INF/lib/replace.jar"
while [ $# -gt 0 ]
do
	case $1 in 
	-p )
	 	case $2 in
			wap )
				gulp production-wap
				find dist/wap -name "*.html" -type f | xargs -I {}  sh replace.sh {} $JAR $CONF 
			;;
			pc )
			;;
			*)
				echo "param must be wap or pc";
				exit 1;
			;;
		esac
	;;
	esac
	shift;
done



