import * as cdk from "aws-cdk-lib"
import * as ec2 from "aws-cdk-lib/aws-ec2"
import { IpAddresses, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2"
import * as elasticbeanstalk from "aws-cdk-lib/aws-elasticbeanstalk"
import { Construct } from "constructs"

// console.log(process.env)

export interface QHHTCamachoInfrastructureProps extends cdk.StackProps {
    readonly ENV: string
    readonly cidr: string
    readonly maxAzs: number
    readonly applicationName: string
    readonly tierName: string
    readonly tierType: string
    readonly solutionStackName: string
    readonly serviceRole: string
    readonly ec2InstanceProfile: string
    readonly loadBalancerType: string
    readonly instanceType: string
    readonly ASGMinSize: string
    readonly ASGMaxSize: string
    // readonly vpcName: string
    // readonly vpcCidr: string
    // readonly loadbalancerInboundCIDR: string
    // readonly loadbalancerOutboundCIDR: string
    // readonly webserverOutboundCIDR: string
    // readonly zipFileName: string
    // readonly managedActionsEnabled: string
    // readonly updateLevel: string
    // readonly preferredUpdateStartTime: string
    // readonly streamLogs: string
    // readonly deleteLogsOnTerminate: string
    // readonly logRetentionDays: string
    // readonly lbHTTPSEnabled: boolean
    // readonly lbHTTPSCertificateArn: string
    // readonly lbSSLPolicy: string
    // readonly databaseSettings: DatabaseProps
}

export class QHHTCamachoInfrastructure extends cdk.Stack {
    public readonly vpc: Vpc

    constructor(
        scope: Construct,
        id: string,
        props: QHHTCamachoInfrastructureProps
    ) {
        super(scope, id, props)

        let {
            ENV,
            cidr,
            maxAzs,
            applicationName,
            tierName,
            tierType,
            solutionStackName,
            serviceRole,
            ec2InstanceProfile,
            loadBalancerType,
            instanceType,
            ASGMinSize,
            ASGMaxSize,
        } = props

        this.vpc = new Vpc(this, `VPC`, {
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

        // Define a new Elastic Beanstalk application
        const app = new elasticbeanstalk.CfnApplication(this, "EBApplication", {
            applicationName,
        })

        const publicSubnets = this.vpc.selectSubnets({
            subnetType: ec2.SubnetType.PUBLIC,
        }).subnets

        // A helper function to create a comma separated string from subnets ids
        const createCommaSeparatedList = function (
            subnets: ec2.ISubnet[]
        ): string {
            return subnets
                .map((subnet: ec2.ISubnet) => subnet.subnetId)
                .toString()
        }

        const lbSubnets = createCommaSeparatedList(publicSubnets)

        // // Define settings for the Elastic Beanstalk application
        // // Documentation for settings: https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options-general.html
        var ebSettings = [
            // [
            //     "aws:elasticbeanstalk:managedactions",
            //     "ServiceRoleForManagedUpdates",
            //     serviceRole,
            // ],
            ["aws:elasticbeanstalk:environment", "ServiceRole", serviceRole],
            [
                "aws:autoscaling:launchconfiguration",
                "IamInstanceProfile",
                ec2InstanceProfile,
            ],
            [
                "aws:elasticbeanstalk:environment",
                "LoadBalancerType",
                loadBalancerType,
            ],
            [
                "aws:autoscaling:launchconfiguration",
                "InstanceType",
                instanceType,
            ],
            ["aws:autoscaling:asg", "MinSize", ASGMinSize],
            ["aws:autoscaling:asg", "MaxSize", ASGMaxSize],
            ["aws:ec2:vpc", "VPCId", this.vpc.vpcId],
            ["aws:ec2:vpc", "Subnets", lbSubnets],
            ["aws:ec2:vpc", "ELBSubnets", lbSubnets],
            [
                "aws:elasticbeanstalk:application:environment",
                "REGION",
                this.region,
            ],
        ]

        const optionSettingProperties: elasticbeanstalk.CfnEnvironment.OptionSettingProperty[] =
            ebSettings.map((setting) => ({
                namespace: setting[0],
                optionName: setting[1],
                value: setting[2],
            }))

        // Create Elastic Beanstalk environment
        new elasticbeanstalk.CfnEnvironment(this, `EBEnvironment-${ENV}`, {
            applicationName: applicationName,
            tier: {
                name: tierName,
                type: tierType,
            },
            environmentName: `${applicationName}-${ENV}`,
            solutionStackName: solutionStackName,
            optionSettings: optionSettingProperties,
        })
    }
}
