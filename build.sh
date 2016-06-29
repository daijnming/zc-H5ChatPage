CONF="WEB-INF/replace.conf"
JAR="WEB-INF/lib/replace.jar"

replaceScript(){
   java -jar $JAR -s $1 -c $CONFIG > ${1}_temp
   rm $1
   mv ${1}_temp $1
}
