sleep 5
# A dummy script which takes one input to trigger the map chaining test
echo "jp : $JOBPROFILE" > ./dummDvl.log
echo "This is some content... $(cat $dummyInput)" >> ./dummDvl.log
echo $iterValue >> ./dummDvl.log
iVal=$(cat $dummyInput)
val=$(( ( RANDOM % 10 )  + 1 ))

echo "{\"dummyOutput\": $iVal}"



