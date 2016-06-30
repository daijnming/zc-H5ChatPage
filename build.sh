CONF="WEB-INF/replace.conf"
JAR="WEB-INF/lib/replace.jar"

replaceScript(){
   java -jar $JAR -s $1 -c $CONFIG > ${1}_temp
   rm $1
   mv ${1}_temp $1
}

while [ $# -gt 0 ]
do
	case $1 in 
	-p )
	 	case $2 in
			wap )
				gulp production-wap
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



