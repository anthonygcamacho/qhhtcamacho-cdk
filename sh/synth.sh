# Example command:
# > sh sh/synth.sh dev

profile="agcamacho"

if [ $1 = "prod" ]
then
    NODE_ENV=$1 cdk --profile=$profile synth
else
    echo "Allowed environment values: prod"
fi