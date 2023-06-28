# Example command:
# > sh sh/deploy.sh dev stack1,stack2,stack3

profile="agcamacho"

stacks=`echo $2 | tr ',' ' '`

if [ $1 = "prod" ]
then
    NODE_ENV=$1 cdk --profile=$profile deploy $stacks
else
    echo "Allowed environment values: prod"
fi