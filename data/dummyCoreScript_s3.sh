sleep 5

# A dummy script which takes two inputs
echo "jp : $JOBPROFILE" > ./dummDvl.log
echo "This is some content... $iterValue" >> ./dummDvl.log

iVal=$(cat $dummyInput_s3a)
jVal=$(cat $dummyInput_s3b)
val=$(( ( RANDOM % 10 )  + 1 ))

iVal=$((iVal + jVal))
echo "{\"dummyOutput_s3\": $iVal}"



