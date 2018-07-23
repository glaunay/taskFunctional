sleep 5
# A dummy script which takes one input but w/ a different output
echo "jp : $JOBPROFILE" > ./dummDvl.log
echo "This is some content... $iterValue" >> ./dummDvl.log

iVal=$(cat $dummyInput_s2)
val=$(( ( RANDOM % 10 )  + 1 ))

((iVal++))
echo "{\"dummyOutput_s2\": $iVal}"



