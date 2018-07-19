sleep 5
# A dummy script which takes one input but w/ a different output
echo "This is some content... $iterValue" > ./toto.txt

iVal=$(cat $dummyInput_s2)
val=$(( ( RANDOM % 10 )  + 1 ))

((iVal++))
echo "{\"dummyOutput_s2\": $iVal}"



