import * as cdk from "aws-cdk-lib"
import { IpAddresses, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2"
import { Construct } from "constructs"

// console.log(process.env)

interface CoreInfrastructureProps extends cdk.StackProps {
    environment: string
    prefix: string
    cidr: string
    maxAzs: number
}

export class CoreInfrastructure extends cdk.Stack {
    public readonly vpc: Vpc

    constructor(scope: Construct, id: string, props: CoreInfrastructureProps) {
        super(scope, id, props)

        let { environment, prefix, cidr, maxAzs } = props

        this.vpc = new Vpc(this, `${prefix}-VPC`, {
            ipAddresses: IpAddresses.cidr(cidr),
            maxAzs,
            subnetConfiguration: [
                {
                    cidrMask: 20,
                    name: "public",
                    subnetType: SubnetType.PUBLIC,
                },
                // {
                //     cidrMask: 20,
                //     name: "app",
                //     subnetType: SubnetType.PRIVATE_WITH_EGRESS,
                // },
                // {
                //     cidrMask: 20,
                //     name: "database",
                //     subnetType: SubnetType.PRIVATE_ISOLATED,
                // },
            ],
        })
    }
}
