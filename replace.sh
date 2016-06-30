   JAR=$2;
   CONF=$3
   java -jar $JAR -s $1 -c $CONF > ${1}_temp
   rm $1
   mv ${1}_temp $1

